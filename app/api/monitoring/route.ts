import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopSdk } from "@/lib/whop-sdk";
import { z } from "zod";
import {
  initializeMonitoring,
  shutdownMonitoring,
  healthCheck,
  getMonitoringEngine,
} from "@/lib/monitoring/init";
import { headers } from "next/headers";

const testMonitorSchema = z.object({
  monitorId: z.string(),
  userId: z.string(),
});

const monitoringActionSchema = z.object({
  action: z.enum(["start", "stop", "status", "stats", "health", "test"]),
  monitorId: z.string().optional(),
  userId: z.string().optional(),
});

// GET /api/monitoring - Get monitoring system status and stats
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 MonitoringAPI: GET request received");

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";
    const monitorId = searchParams.get("monitorId");

    // For monitoring stats, we need to authenticate the user
    if (action === "stats") {
      const headersList = await headers();
      
      try {
        // Extract the user ID from the verified auth JWT token
        const { userId } = await whopSdk.verifyUserToken(headersList);
        console.log("✅ MonitoringAPI: User authenticated:", userId);
      } catch (authError) {
        console.error("❌ MonitoringAPI: Authentication failed:", authError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    switch (action) {
      case "status": {
        try {
          const engine = getMonitoringEngine();
          const stats = engine.getStats();
          const schedulerMetrics = engine.getSchedulerMetrics();

          return NextResponse.json({
            status: "running",
            stats,
            schedulerMetrics,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return NextResponse.json({
            status: "stopped",
            error: "Monitoring engine not initialized",
            timestamp: new Date().toISOString(),
          });
        }
      }

      case "stats": {
        try {
          const engine = getMonitoringEngine();
          const stats = engine.getStats();

          // Get additional database stats
          const dbStats = await db.monitor.groupBy({
            by: ["status"],
            _count: true,
          });

          const checkStats = await db.monitorCheck.aggregate({
            _count: true,
            _avg: {
              responseTime: true,
            },
            where: {
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
              },
            },
          });

          console.log("✅ MonitoringAPI: Retrieved stats");
          return NextResponse.json({
            engineStats: stats,
            monitorCounts: dbStats,
            recentChecks: {
              count: checkStats._count,
              averageResponseTime: checkStats._avg.responseTime || 0,
            },
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("❌ MonitoringAPI: Failed to get stats:", error);
          return NextResponse.json(
            { error: "Failed to get stats" },
            { status: 500 },
          );
        }
      }

      case "health": {
        const health = await healthCheck();
        return NextResponse.json(health);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ MonitoringAPI: Error in monitoring API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/monitoring - Control monitoring system and test monitors
export async function POST(request: NextRequest) {
  try {
    console.log("🔍 MonitoringAPI: POST request received");

    const body = await request.json();
    const { action, monitorId, userId } = monitoringActionSchema.parse(body);

    // For actions that need authentication
    if (action === "test" || action === "start" || action === "stop") {
      const headersList = await headers();
      
      try {
        // Extract the user ID from the verified auth JWT token
        const { userId: authenticatedUserId } = await whopSdk.verifyUserToken(headersList);
        console.log("✅ MonitoringAPI: User authenticated:", authenticatedUserId);
      } catch (authError) {
        console.error("❌ MonitoringAPI: Authentication failed:", authError);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    switch (action) {
      case "start": {
        try {
          const engine = await initializeMonitoring();
          const stats = engine.getStats();

          console.log("✅ MonitoringAPI: Monitoring system started");
          return NextResponse.json({
            success: true,
            message: "Monitoring system started successfully",
            stats,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("❌ MonitoringAPI: Error starting monitoring:", error);
          return NextResponse.json(
            {
              success: false,
              error: "Failed to start monitoring system",
              details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          );
        }
      }

      case "stop": {
        try {
          await shutdownMonitoring();

          console.log("✅ MonitoringAPI: Monitoring system stopped");
          return NextResponse.json({
            success: true,
            message: "Monitoring system stopped successfully",
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("❌ MonitoringAPI: Error stopping monitoring:", error);
          return NextResponse.json(
            {
              success: false,
              error: "Failed to stop monitoring system",
              details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          );
        }
      }

      case "test": {
        if (!monitorId || !userId) {
          return NextResponse.json(
            { error: "monitorId and userId are required for test action" },
            { status: 400 },
          );
        }

        try {
          // Verify monitor exists and belongs to user
          const monitor = await db.monitor.findFirst({
            where: { id: monitorId, userId },
            include: { alerts: true },
          });

          if (!monitor) {
            return NextResponse.json(
              { error: "Monitor not found or unauthorized" },
              { status: 404 },
            );
          }

          // Get or initialize monitoring engine
          let engine;
          try {
            engine = getMonitoringEngine();
          } catch {
            engine = await initializeMonitoring();
          }

          // Run the monitor now
          const result = await engine.runMonitorNow(monitorId);

          // Update monitor's last check time
          await db.monitor.update({
            where: { id: monitorId },
            data: { lastCheck: new Date() },
          });

          return NextResponse.json({
            success: true,
            message: "Monitor test completed",
            result: {
              monitorId: result.monitorId,
              success: result.success,
              responseTime: result.scrapeResult?.responseTime,
              statusCode: result.scrapeResult?.data?.statusCode,
              error: result.error,
              timestamp: result.timestamp,
              executionTime: result.executionTime,
            },
          });
        } catch (error) {
          console.error("Error testing monitor:", error);
          return NextResponse.json(
            {
              success: false,
              error: "Failed to test monitor",
              details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          );
        }
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error in monitoring API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/monitoring - Update monitoring configuration
export async function PUT(request: NextRequest) {
  // For now, monitoring configuration updates aren't needed
  return NextResponse.json({
    success: true,
    message: "Monitoring configuration update not implemented",
    timestamp: new Date().toISOString(),
  });
}

// DELETE /api/monitoring - Clear monitoring data or reset engine
export async function DELETE(request: NextRequest) {
  // For now, monitoring data clearing isn't needed  
  return NextResponse.json({
    success: true,
    message: "Monitoring data clearing not implemented",
    timestamp: new Date().toISOString(),
  });
}
