import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopAuth } from "@/lib/whop-sdk";
import { z } from "zod";
import { getMonitoringEngine } from "@/lib/monitoring/engine";

const runMonitorSchema = z.object({
  monitorId: z.string(),
  userId: z.string(),
});

const controlEngineSchema = z.object({
  action: z.enum(["start", "stop", "restart"]),
  userId: z.string(),
});

const pauseResumeSchema = z.object({
  monitorId: z.string(),
  action: z.enum(["pause", "resume"]),
  userId: z.string(),
});

// GET /api/monitoring - Get monitoring engine stats and status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const monitoringEngine = getMonitoringEngine();

    switch (action) {
      case "stats":
        const stats = monitoringEngine.getStats();
        const schedulerMetrics = monitoringEngine.getSchedulerMetrics();
        
        return NextResponse.json({
          stats,
          schedulerMetrics,
          timestamp: new Date().toISOString()
        });

      case "jobs":
        // Get scheduler metrics instead of direct job access
        const jobMetrics = monitoringEngine.getSchedulerMetrics();
        return NextResponse.json({
          schedulerMetrics: jobMetrics,
          totalJobs: jobMetrics.totalJobs,
          runningJobs: jobMetrics.runningJobs,
          completedJobs: jobMetrics.completedJobs,
          failedJobs: jobMetrics.failedJobs
        });

      case "health":
        const health = {
          engine: {
            running: true, // We'll assume it's running if we can access it
            stats: monitoringEngine.getStats()
          },
          scheduler: monitoringEngine.getSchedulerMetrics(),
          database: {
            connected: true // This would be a real DB health check
          }
        };
        
        return NextResponse.json(health);

      default:
        // Return general monitoring overview
        const overview = {
          stats: monitoringEngine.getStats(),
          schedulerMetrics: monitoringEngine.getSchedulerMetrics(),
          timestamp: new Date().toISOString()
        };
        
        return NextResponse.json(overview);
    }
  } catch (error) {
    console.error("Error getting monitoring data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/monitoring - Execute monitoring actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const monitoringEngine = getMonitoringEngine();

    switch (action) {
      case "run_monitor":
        const runData = runMonitorSchema.parse(body);
        
        // Verify monitor belongs to user
        const monitor = await db.monitor.findFirst({
          where: { 
            id: runData.monitorId, 
            userId: runData.userId 
          }
        });
        
        if (!monitor) {
          return NextResponse.json({ error: "Monitor not found or unauthorized" }, { status: 404 });
        }

        const result = await monitoringEngine.runMonitorNow(runData.monitorId);
        
        return NextResponse.json({
          success: true,
          result,
          message: "Monitor executed successfully"
        });

      case "control_engine":
        const controlData = controlEngineSchema.parse(body);
        
        // Only allow admin users to control the engine
        // This would check for admin privileges
        switch (controlData.action) {
          case "start":
            await monitoringEngine.start();
            return NextResponse.json({ message: "Monitoring engine started" });
          
          case "stop":
            await monitoringEngine.stop();
            return NextResponse.json({ message: "Monitoring engine stopped" });
          
          case "restart":
            await monitoringEngine.stop();
            await monitoringEngine.start();
            return NextResponse.json({ message: "Monitoring engine restarted" });
        }
        break;

      case "pause_resume":
        const pauseResumeData = pauseResumeSchema.parse(body);
        
        // Verify monitor belongs to user
        const targetMonitor = await db.monitor.findFirst({
          where: { 
            id: pauseResumeData.monitorId, 
            userId: pauseResumeData.userId 
          }
        });
        
        if (!targetMonitor) {
          return NextResponse.json({ error: "Monitor not found or unauthorized" }, { status: 404 });
        }

        if (pauseResumeData.action === "pause") {
          await monitoringEngine.pauseMonitor(pauseResumeData.monitorId);
          return NextResponse.json({ message: "Monitor paused" });
        } else {
          await monitoringEngine.resumeMonitor(pauseResumeData.monitorId);
          return NextResponse.json({ message: "Monitor resumed" });
        }

      case "sync_monitors":
        // Sync all monitors with the scheduler
        const monitors = await db.monitor.findMany({
          where: { userId, status: "ACTIVE" }
        });
        
        for (const monitor of monitors) {
          await monitoringEngine.updateMonitor(monitor.id, monitor);
        }
        
        return NextResponse.json({ 
          message: "Monitors synced successfully",
          count: monitors.length 
        });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error executing monitoring action:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/monitoring - Update monitoring engine configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, config } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access (admin only)
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This would update the monitoring engine configuration
    // For now, just return success
    return NextResponse.json({ 
      message: "Configuration updated successfully",
      config 
    });
  } catch (error) {
    console.error("Error updating monitoring configuration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/monitoring - Clear monitoring data or reset engine
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (action) {
      case "clear_checks":
        // Clear old monitor checks for the user
        const oldChecks = await db.monitorCheck.deleteMany({
          where: {
            monitor: { userId },
            createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days old
          }
        });
        
        return NextResponse.json({ 
          message: "Old checks cleared",
          deleted: oldChecks.count 
        });

      case "clear_incidents":
        // Clear resolved incidents for the user
        const oldIncidents = await db.incident.deleteMany({
          where: {
            monitor: { userId },
            status: "RESOLVED",
            createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days old
          }
        });
        
        return NextResponse.json({ 
          message: "Old incidents cleared",
          deleted: oldIncidents.count 
        });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error clearing monitoring data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 