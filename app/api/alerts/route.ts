import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopAuth } from "@/lib/whop-sdk";
import { PricingService } from "@/lib/pricing";
import { z } from "zod";

const createAlertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "DOWN", "UP", "SLOW_RESPONSE", "SSL_EXPIRY", "KEYWORD_MISSING", 
    "KEYWORD_FOUND", "STATUS_CODE", "WHOP_THRESHOLD", "WHOP_ANOMALY"
  ]),
  monitorId: z.string().min(1, "Monitor ID is required"),
  conditions: z.string().default("{}"), // JSON string
  threshold: z.number().optional(),
  duration: z.number().default(300),
  channels: z.array(z.enum(["EMAIL", "PUSH", "DISCORD", "WEBHOOK", "SMS"])),
  escalation: z.record(z.any()).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DISABLED"]).default("ACTIVE"),
});

const updateAlertSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.enum([
    "DOWN", "UP", "SLOW_RESPONSE", "SSL_EXPIRY", "KEYWORD_MISSING", 
    "KEYWORD_FOUND", "STATUS_CODE", "WHOP_THRESHOLD", "WHOP_ANOMALY"
  ]).optional(),
  conditions: z.string().optional(),
  threshold: z.number().optional(),
  duration: z.number().optional(),
  channels: z.array(z.enum(["EMAIL", "PUSH", "DISCORD", "WEBHOOK", "SMS"])).optional(),
  escalation: z.record(z.any()).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DISABLED"]).optional(),
});

// GET /api/alerts - Get alerts for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const monitorId = searchParams.get("monitorId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause based on filters
    const where: any = {
      monitor: {
        userId: userId
      }
    };

    if (monitorId) {
      where.monitorId = monitorId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const alerts = await db.alert.findMany({
      where,
      include: {
        monitor: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            incidents: true,
            notifications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...alertData } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's plan and check alert limits
    const userPlan = await whopAuth.getUserPlan(userId);
    const pricingService = new PricingService();
    const planLimits = pricingService.getPlanLimits(userPlan);

    // Check if user has reached alert limit
    const existingAlerts = await db.alert.count({
      where: {
        monitor: {
          userId: userId
        }
      }
    });

    if (planLimits.maxAlerts !== -1 && existingAlerts >= planLimits.maxAlerts) {
      return NextResponse.json({ 
        error: `Alert limit reached. Your ${userPlan} plan allows ${planLimits.maxAlerts} alerts.` 
      }, { status: 400 });
    }

    // Validate input
    const validatedData = createAlertSchema.parse(alertData);

    // Check if selected channels are available for user's plan
    const availableChannels = pricingService.getAvailableChannels(userPlan);
    const invalidChannels = validatedData.channels.filter(channel => 
      !availableChannels.includes(channel)
    );

    if (invalidChannels.length > 0) {
      return NextResponse.json({ 
        error: `Channels not available for your ${userPlan} plan: ${invalidChannels.join(', ')}` 
      }, { status: 400 });
    }

    // Check if monitor exists and belongs to user
    const monitor = await db.monitor.findFirst({
      where: { 
        id: validatedData.monitorId,
        userId: userId 
      },
    });

    if (!monitor) {
      return NextResponse.json({ error: "Monitor not found or unauthorized" }, { status: 404 });
    }

    // Create the alert
    const alert = await db.alert.create({
      data: {
        ...validatedData,
        escalation: validatedData.escalation ? JSON.stringify(validatedData.escalation) : undefined,
      },
      include: {
        monitor: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            incidents: true,
            notifications: true,
          },
        },
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error creating alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/alerts - Update an existing alert
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, ...updateData } = body;
    
    if (!id || !userId) {
      return NextResponse.json({ error: "Alert ID and User ID are required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if alert exists and belongs to user's monitors
    const existingAlert = await db.alert.findFirst({
      where: { 
        id,
        monitor: {
          userId: userId
        }
      },
    });

    if (!existingAlert) {
      return NextResponse.json({ error: "Alert not found or unauthorized" }, { status: 404 });
    }

    // Validate input
    const validatedData = updateAlertSchema.parse(updateData);

    // If updating channels, check if they're available for user's plan
    if (validatedData.channels) {
      const userPlan = await whopAuth.getUserPlan(userId);
      const pricingService = new PricingService();
      const availableChannels = pricingService.getAvailableChannels(userPlan);
      const invalidChannels = validatedData.channels.filter(channel => 
        !availableChannels.includes(channel)
      );

      if (invalidChannels.length > 0) {
        return NextResponse.json({ 
          error: `Channels not available for your ${userPlan} plan: ${invalidChannels.join(', ')}` 
        }, { status: 400 });
      }
    }

    // Update the alert
    const alert = await db.alert.update({
      where: { id },
      data: {
        ...validatedData,
        escalation: validatedData.escalation ? JSON.stringify(validatedData.escalation) : undefined,
      },
      include: {
        monitor: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            incidents: true,
            notifications: true,
          },
        },
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error updating alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/alerts - Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    
    if (!id || !userId) {
      return NextResponse.json({ error: "Alert ID and User ID are required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if alert exists and belongs to user's monitors
    const existingAlert = await db.alert.findFirst({
      where: { 
        id,
        monitor: {
          userId: userId
        }
      },
    });

    if (!existingAlert) {
      return NextResponse.json({ error: "Alert not found or unauthorized" }, { status: 404 });
    }

    // Delete the alert (cascading deletes will handle related incidents and notifications)
    await db.alert.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/alerts/test - Test an alert manually
export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.endsWith('/test')) {
    try {
      const body = await request.json();
      const { alertId, userId } = body;
      
      if (!alertId || !userId) {
        return NextResponse.json({ error: "Alert ID and User ID are required" }, { status: 400 });
      }

      // Validate user access
      const hasAccess = await whopAuth.validateUserAccess(userId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get alert with monitor
      const alert = await db.alert.findFirst({
        where: { 
          id: alertId,
          monitor: {
            userId: userId
          }
        },
        include: {
          monitor: true,
        },
      });

      if (!alert) {
        return NextResponse.json({ error: "Alert not found or unauthorized" }, { status: 404 });
      }

      // Import and use notification service to send test alert
      const NotificationService = (await import('@/lib/notifications/notification-service')).default;
      const notificationService = NotificationService.getInstance();

      const payload = {
        title: `Test Alert: ${alert.name}`,
        message: `This is a test alert for monitor "${alert.monitor.name}". Your alert configuration is working correctly.`,
        severity: 'low' as const,
        metadata: {
          test: true,
          monitorId: alert.monitor.id,
          alertId: alert.id,
          url: alert.monitor.url,
        },
        timestamp: new Date(),
      };

      // Send test notification
      await notificationService.sendNotification(
        userId,
        alert.id,
        alert.channels,
        payload
      );

      return NextResponse.json({ message: "Test alert sent successfully" });
    } catch (error) {
      console.error("Error sending test alert:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
  
  // If not test endpoint, fallback to regular POST
  return POST(request);
} 