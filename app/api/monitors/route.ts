import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopAuth, whopPricing, PlanType } from "@/lib/whop-sdk";
import { z } from "zod";

const createMonitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Valid URL is required"),
  type: z.enum(["HTTP", "HTTPS", "PING", "TCP", "WHOP_METRICS", "WHOP_SALES", "WHOP_USERS", "WHOP_REVENUE"]),
  interval: z.number().min(60).max(86400).default(300),
  timeout: z.number().min(5).max(120).default(30),
  retries: z.number().min(1).max(10).default(3),
  method: z.string().default("GET"),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  expectedStatus: z.number().min(100).max(599).default(200),
  expectedContent: z.string().optional(),
  expectedKeywords: z.array(z.string()).default([]),
  sslCheck: z.boolean().default(false),
  sslExpiryDays: z.number().min(1).max(365).default(30),
  responseTimeThreshold: z.number().min(100).max(30000).default(5000),
  whopMetrics: z.record(z.any()).optional(),
  whopThresholds: z.record(z.any()).optional(),
});

// GET /api/monitors - Get all monitors for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const monitors = await db.monitor.findMany({
      where: { userId },
      include: {
        alerts: true,
        _count: {
          select: {
            checks: true,
            incidents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(monitors);
  } catch (error) {
    console.error("Error fetching monitors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/monitors - Create a new monitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, companyId, ...monitorData } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    const validatedData = createMonitorSchema.parse(monitorData);

    // Check if user can create more monitors based on their plan
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { monitors: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planType = user.plan as PlanType;
    const limits = whopPricing.getPlanLimits(planType);
    
    if (limits.monitors !== -1 && user._count.monitors >= limits.monitors) {
      return NextResponse.json({ 
        error: "Monitor limit reached for your plan",
        limit: limits.monitors,
        current: user._count.monitors
      }, { status: 400 });
    }

    // Create the monitor
    const monitor = await db.monitor.create({
      data: {
        ...validatedData,
        userId,
        companyId,
        status: "ACTIVE",
      },
      include: {
        alerts: true,
        _count: {
          select: {
            checks: true,
            incidents: true,
          },
        },
      },
    });

    return NextResponse.json(monitor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error creating monitor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/monitors - Update a monitor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, ...updateData } = body;
    
    if (!id || !userId) {
      return NextResponse.json({ error: "Monitor ID and User ID are required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if monitor exists and belongs to user
    const existingMonitor = await db.monitor.findFirst({
      where: { id, userId },
    });

    if (!existingMonitor) {
      return NextResponse.json({ error: "Monitor not found or unauthorized" }, { status: 404 });
    }

    // Validate input
    const validatedData = createMonitorSchema.partial().parse(updateData);

    // Update the monitor
    const monitor = await db.monitor.update({
      where: { id },
      data: validatedData,
      include: {
        alerts: true,
        _count: {
          select: {
            checks: true,
            incidents: true,
          },
        },
      },
    });

    return NextResponse.json(monitor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error updating monitor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/monitors - Delete a monitor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    
    if (!id || !userId) {
      return NextResponse.json({ error: "Monitor ID and User ID are required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if monitor exists and belongs to user
    const existingMonitor = await db.monitor.findFirst({
      where: { id, userId },
    });

    if (!existingMonitor) {
      return NextResponse.json({ error: "Monitor not found or unauthorized" }, { status: 404 });
    }

    // Delete the monitor (cascading deletes will handle related records)
    await db.monitor.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Monitor deleted successfully" });
  } catch (error) {
    console.error("Error deleting monitor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 