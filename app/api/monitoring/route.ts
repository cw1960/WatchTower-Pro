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
  } catch (error) {
    console.error("❌ MonitoringAPI: Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
