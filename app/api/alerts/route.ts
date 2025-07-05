import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PricingService } from "@/lib/pricing";
import { z } from "zod";

const createAlertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "DOWN",
    "UP",
    "SLOW_RESPONSE",
    "SSL_EXPIRY",
    "KEYWORD_MISSING",
    "KEYWORD_FOUND",
    "STATUS_CODE",
    "WHOP_THRESHOLD",
    "WHOP_ANOMALY",
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
  type: z
    .enum([
      "DOWN",
      "UP",
      "SLOW_RESPONSE",
      "SSL_EXPIRY",
      "KEYWORD_MISSING",
      "KEYWORD_FOUND",
      "STATUS_CODE",
      "WHOP_THRESHOLD",
      "WHOP_ANOMALY",
    ])
    .optional(),
  conditions: z.string().optional(),
  threshold: z.number().optional(),
  duration: z.number().optional(),
  channels: z
    .array(z.enum(["EMAIL", "PUSH", "DISCORD", "WEBHOOK", "SMS"]))
    .optional(),
  escalation: z.record(z.any()).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DISABLED"]).optional(),
});

// GET /api/alerts - Get alerts for the current user
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 AlertsAPI: GET request received");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const monitorId = searchParams.get("monitorId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    if (!userId) {
      console.log("❌ AlertsAPI: No userId provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    console.log("✅ AlertsAPI: User ID from query:", userId);

    // Test database connection first
    console.log("🔍 AlertsAPI: Testing database connection...");
    try {
      await db.$queryRaw`SELECT 1`;
      console.log("✅ AlertsAPI: Database connection successful");
    } catch (dbError) {
      console.error("❌ AlertsAPI: Database connection failed:", dbError);
      return NextResponse.json(
        { error: "Database connection failed", details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 },
      );
    }

    // Build where clause based on filters
    const where: any = {
      monitor: {
        userId: userId,
      },
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

    console.log("🔍 AlertsAPI: Fetching alerts for user:", userId);
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

    console.log("✅ AlertsAPI: Found", alerts.length, "alerts");
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("❌ AlertsAPI: Detailed error:", error);
    console.error("❌ AlertsAPI: Error name:", error instanceof Error ? error.name : "Unknown");
    console.error("❌ AlertsAPI: Error message:", error instanceof Error ? error.message : String(error));
    console.error("❌ AlertsAPI: Error stack:", error instanceof Error ? error.stack : "No stack");
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("❌ AlertsAPI: Prisma error code:", (error as any).code);
      console.error("❌ AlertsAPI: Prisma error meta:", (error as any).meta);
    }

    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.name : "Unknown"
      },
      { status: 500 },
    );
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 AlertsAPI: POST request received");

    const body = await request.json();
    const { userId, ...alertData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    console.log("✅ AlertsAPI: User ID from body:", userId);

    // Get user's plan and check alert limits
    const userPlan = "STARTER" as const; // TODO: Get actual user plan from database
    const canCreateAlertResult = await PricingService.canCreateAlert(userId, userPlan);

    if (!canCreateAlertResult.allowed) {
      return NextResponse.json(
        {
          error: canCreateAlertResult.message || "Alert limit reached",
        },
        { status: 400 },
      );
    }

    // Validate input
    const validatedData = createAlertSchema.parse(alertData);

    // Check if selected channels are available for user's plan
    const invalidChannels = validatedData.channels.filter(
      (channel) => !PricingService.hasChannelAccess(userPlan, channel as any),
    );

    if (invalidChannels.length > 0) {
      return NextResponse.json(
        {
          error: `Channels not available for your ${userPlan} plan: ${invalidChannels.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Check if monitor exists and belongs to user
    const monitor = await db.monitor.findFirst({
      where: {
        id: validatedData.monitorId,
        userId: userId,
      },
    });

    if (!monitor) {
      return NextResponse.json(
        { error: "Monitor not found or unauthorized" },
        { status: 404 },
      );
    }

    // Create the alert
    const alert = await db.alert.create({
      data: {
        ...validatedData,
        userId: userId, // Add the userId field required by the database
        escalation: validatedData.escalation
          ? JSON.stringify(validatedData.escalation)
          : undefined,
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

    console.log("✅ AlertsAPI: Created alert:", alert.id);
    return NextResponse.json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("❌ AlertsAPI: Error creating alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/alerts - Update an existing alert
export async function PUT(request: NextRequest) {
  try {
    console.log("🔍 AlertsAPI: PUT request received");

    const body = await request.json();
    const { id, userId, ...updateData } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Alert ID and User ID are required" },
        { status: 400 },
      );
    }

    console.log("✅ AlertsAPI: User ID from body:", userId);

    // Check if alert exists and belongs to user's monitors
    const existingAlert = await db.alert.findFirst({
      where: {
        id,
        monitor: {
          userId: userId,
        },
      },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: "Alert not found or unauthorized" },
        { status: 404 },
      );
    }

    // Validate input
    const validatedData = updateAlertSchema.parse(updateData);

    // If updating channels, check if they're available for user's plan
    if (validatedData.channels) {
      const userPlan = "STARTER" as const; // TODO: Get actual user plan from database
      const invalidChannels = validatedData.channels.filter(
        (channel) => !PricingService.hasChannelAccess(userPlan, channel as any),
      );

      if (invalidChannels.length > 0) {
        return NextResponse.json(
          {
            error: `Channels not available for your ${userPlan} plan: ${invalidChannels.join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    // Update the alert
    const alert = await db.alert.update({
      where: { id },
      data: {
        ...validatedData,
        escalation: validatedData.escalation
          ? JSON.stringify(validatedData.escalation)
          : undefined,
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

    console.log("✅ AlertsAPI: Updated alert:", alert.id);
    return NextResponse.json(alert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("❌ AlertsAPI: Error updating alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/alerts - Delete an alert
export async function DELETE(request: NextRequest) {
  try {
    console.log("🔍 AlertsAPI: DELETE request received");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Alert ID and User ID are required" },
        { status: 400 },
      );
    }

    console.log("✅ AlertsAPI: User ID from query:", userId);

    // Check if alert exists and belongs to user's monitors
    const existingAlert = await db.alert.findFirst({
      where: {
        id,
        monitor: {
          userId: userId,
        },
      },
    });

    if (!existingAlert) {
      return NextResponse.json(
        { error: "Alert not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the alert
    await db.alert.delete({
      where: { id },
    });

    console.log("✅ AlertsAPI: Deleted alert:", id);
    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("❌ AlertsAPI: Error deleting alert:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


