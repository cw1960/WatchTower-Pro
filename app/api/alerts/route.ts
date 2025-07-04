import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopAuth, whopPricing, PlanType } from "@/lib/whop-sdk";
import { z } from "zod";

const createAlertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["DOWN", "UP", "SLOW_RESPONSE", "SSL_EXPIRY", "KEYWORD_MISSING", "KEYWORD_FOUND", "STATUS_CODE", "WHOP_THRESHOLD", "WHOP_ANOMALY"]),
  conditions: z.record(z.any()),
  threshold: z.number().optional(),
  duration: z.number().min(60).max(86400).default(300),
  channels: z.array(z.enum(["EMAIL", "SLACK", "DISCORD", "WEBHOOK", "SMS", "PUSH"])),
  escalation: z.record(z.any()).optional(),
  monitorId: z.string().optional(),
});

// GET /api/alerts - Get all alerts for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const monitorId = searchParams.get("monitorId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = { userId };
    if (monitorId) {
      where.monitorId = monitorId;
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
    const { userId, companyId, ...alertData } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    const validatedData = createAlertSchema.parse(alertData);

    // Check if user can create more alerts based on their plan
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { alerts: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planType = user.plan as PlanType;
    const limits = whopPricing.getPlanLimits(planType);
    
    if (limits.alerts !== -1 && user._count.alerts >= limits.alerts) {
      return NextResponse.json({ 
        error: "Alert limit reached for your plan",
        limit: limits.alerts,
        current: user._count.alerts
      }, { status: 400 });
    }

    // If monitorId is provided, verify it belongs to the user
    if (validatedData.monitorId) {
      const monitor = await db.monitor.findFirst({
        where: { id: validatedData.monitorId, userId },
      });

      if (!monitor) {
        return NextResponse.json({ error: "Monitor not found or unauthorized" }, { status: 404 });
      }
    }

    // Create the alert
    const alert = await db.alert.create({
      data: {
        ...validatedData,
        userId,
        companyId,
        status: "ACTIVE",
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

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error creating alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/alerts - Update an alert
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

    // Check if alert exists and belongs to user
    const existingAlert = await db.alert.findFirst({
      where: { id, userId },
    });

    if (!existingAlert) {
      return NextResponse.json({ error: "Alert not found or unauthorized" }, { status: 404 });
    }

    // Validate input
    const validatedData = createAlertSchema.partial().parse(updateData);

    // If monitorId is being updated, verify it belongs to the user
    if (validatedData.monitorId) {
      const monitor = await db.monitor.findFirst({
        where: { id: validatedData.monitorId, userId },
      });

      if (!monitor) {
        return NextResponse.json({ error: "Monitor not found or unauthorized" }, { status: 404 });
      }
    }

    // Update the alert
    const alert = await db.alert.update({
      where: { id },
      data: validatedData,
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

    // Check if alert exists and belongs to user
    const existingAlert = await db.alert.findFirst({
      where: { id, userId },
    });

    if (!existingAlert) {
      return NextResponse.json({ error: "Alert not found or unauthorized" }, { status: 404 });
    }

    // Delete the alert (cascading deletes will handle related records)
    await db.alert.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 