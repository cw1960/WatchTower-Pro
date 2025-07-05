import { getMonitoringEngine } from "./engine";
import { db } from "@/lib/db";

// Initialize the monitoring system
export async function initializeMonitoring() {
  try {
    console.log("🚀 Initializing WatchTower Pro Monitoring System...");

    // Get the monitoring engine instance
    const engine = getMonitoringEngine({
      scheduler: {
        maxConcurrentJobs: 10,
        maxRetries: 3,
        retryDelay: 60,
        batchSize: 5,
        enableMetrics: true,
        enableLogging: true,
      },
      defaultTimeout: 30000,
      maxConcurrentMonitors: 10,
      enableAutoScaling: false,
      retryFailedChecks: true,
      enableMetrics: true,
      enableLogging: true,
    });

    // Start the monitoring engine
    await engine.start();

    // Get initial stats
    const stats = engine.getStats();
    console.log("📊 Monitoring System Started Successfully!");
    console.log(`   • Total Monitors: ${stats.totalMonitors}`);
    console.log(`   • Active Monitors: ${stats.activeMonitors}`);
    console.log(`   • Total Checks: ${stats.totalChecks}`);
    console.log(
      `   • Success Rate: ${stats.successfulChecks}/${stats.totalChecks}`,
    );

    return engine;
  } catch (error) {
    console.error("❌ Failed to initialize monitoring system:", error);
    throw error;
  }
}

// Gracefully shutdown the monitoring system
export async function shutdownMonitoring() {
  try {
    console.log("🛑 Shutting down monitoring system...");
    const engine = getMonitoringEngine();
    await engine.stop();
    console.log("✅ Monitoring system shut down successfully");
  } catch (error) {
    console.error("❌ Error shutting down monitoring system:", error);
  }
}

// Health check for the monitoring system
export async function healthCheck() {
  try {
    const engine = getMonitoringEngine();
    const stats = engine.getStats();
    const schedulerMetrics = engine.getSchedulerMetrics();

    return {
      healthy: true,
      stats,
      schedulerMetrics,
      database: await checkDatabaseHealth(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Export for use in other parts of the application
export { getMonitoringEngine } from "./engine";
export { getScheduler } from "./scheduler";
export { default as WebScraper } from "./scraper";
export { ConditionEvaluator } from "./conditions";
