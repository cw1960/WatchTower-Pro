import { NextRequest, NextResponse } from "next/server";
import { getMonitoringEngine } from "@/lib/monitoring/engine";

// GET /api/monitoring - Get monitoring status and stats
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 MonitoringAPI: GET request received");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action") || "status";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    console.log("✅ MonitoringAPI: User ID from query:", userId);

    // Try to get monitoring engine with fallback
    try {
      const monitoringEngine = getMonitoringEngine();

      switch (action) {
        case "status":
          const stats = monitoringEngine.getStats();
          const schedulerMetrics = monitoringEngine.getSchedulerMetrics();
          return NextResponse.json({
            status: "running",
            stats,
            schedulerMetrics,
            timestamp: new Date().toISOString(),
          });

        case "stats":
          // Get monitoring stats
          const monitoringStats = monitoringEngine.getStats();
          return NextResponse.json(monitoringStats);

        case "health":
          const healthStats = monitoringEngine.getStats();
          return NextResponse.json({
            status: "healthy",
            stats: healthStats,
            timestamp: new Date().toISOString(),
          });

        default:
          return NextResponse.json(
            { error: "Invalid action parameter" },
            { status: 400 },
          );
      }
    } catch (engineError) {
      console.warn("⚠️ MonitoringAPI: Monitoring engine unavailable, using fallback");
      console.error("Engine error:", engineError);
      
      // Return default stats instead of failing
      const defaultStats = {
        totalMonitors: 0,
        activeMonitors: 0,
        failedMonitors: 0,
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        averageResponseTime: 0,
        alertsTriggered: 0,
        incidentsCreated: 0,
      };

      switch (action) {
        case "status":
          return NextResponse.json({
            status: "stopped",
            stats: defaultStats,
            schedulerMetrics: {},
            timestamp: new Date().toISOString(),
          });

        case "stats":
          return NextResponse.json(defaultStats);

        case "health":
          return NextResponse.json({
            status: "stopped",
            stats: defaultStats,
            timestamp: new Date().toISOString(),
          });

        default:
          return NextResponse.json(
            { error: "Invalid action parameter" },
            { status: 400 },
          );
      }
    }
  } catch (error) {
    console.error("❌ MonitoringAPI: Unexpected error:", error);
    
    // Return default stopped status
    return NextResponse.json({
      status: "stopped",
      stats: {
        totalMonitors: 0,
        activeMonitors: 0,
        failedMonitors: 0,
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        averageResponseTime: 0,
        alertsTriggered: 0,
        incidentsCreated: 0,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
