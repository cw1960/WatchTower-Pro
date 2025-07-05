import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopAuth } from "@/lib/whop-sdk";
import { z } from "zod";

const updateIncidentSchema = z.object({
  status: z.enum(["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"]).optional(),
  description: z.string().optional(),
  resolvedBy: z.record(z.any()).optional(),
});

// GET /api/incidents - Get incidents for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const monitorId = searchParams.get("monitorId");
    const alertId = searchParams.get("alertId");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause based on filters
    const where: any = {};
    
    // Filter by user's monitors
    where.monitor = {
      userId: userId
    };

    if (monitorId) {
      where.monitorId = monitorId;
    }

    if (alertId) {
      where.alertId = alertId;
    }

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    const incidents = await db.incident.findMany({
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
        alert: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            notifications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/incidents - Update an incident
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, ...updateData } = body;
    
    if (!id || !userId) {
      return NextResponse.json({ error: "Incident ID and User ID are required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if incident exists and belongs to user's monitors
    const existingIncident = await db.incident.findFirst({
      where: { 
        id,
        monitor: {
          userId: userId
        }
      },
    });

    if (!existingIncident) {
      return NextResponse.json({ error: "Incident not found or unauthorized" }, { status: 404 });
    }

    // Validate input
    const validatedData = updateIncidentSchema.parse(updateData);

    // If marking as resolved, set resolvedAt timestamp
    if (validatedData.status === "RESOLVED" || validatedData.status === "CLOSED") {
      (validatedData as any).resolvedAt = new Date();
    }

    // Update the incident
    const incident = await db.incident.update({
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
        alert: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            notifications: true,
          },
        },
      },
    });

    return NextResponse.json(incident);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error updating incident:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/incidents - Delete an incident
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    
    if (!id || !userId) {
      return NextResponse.json({ error: "Incident ID and User ID are required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if incident exists and belongs to user's monitors
    const existingIncident = await db.incident.findFirst({
      where: { 
        id,
        monitor: {
          userId: userId
        }
      },
    });

    if (!existingIncident) {
      return NextResponse.json({ error: "Incident not found or unauthorized" }, { status: 404 });
    }

    // Delete the incident (cascading deletes will handle related notifications)
    await db.incident.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Incident deleted successfully" });
  } catch (error) {
    console.error("Error deleting incident:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 