#!/usr/bin/env tsx

import { initializeMonitoring, healthCheck } from "@/lib/monitoring/init";

async function main() {
  console.log("🔧 Starting WatchTower Pro Monitoring System...\n");

  try {
    // Initialize the monitoring system
    const engine = await initializeMonitoring();

    // Perform health check
    const health = await healthCheck();
    console.log("\n🏥 Health Check Results:");
    console.log(
      `   • System Health: ${health.healthy ? "✅ Healthy" : "❌ Unhealthy"}`,
    );
    console.log(
      `   • Database: ${health.database?.connected ? "✅ Connected" : "❌ Disconnected"}`,
    );

    if (health.healthy) {
      console.log("\n🎉 WatchTower Pro is ready to monitor your websites!");
      console.log("\nNext steps:");
      console.log("1. Create monitors via the /api/monitors endpoint");
      console.log("2. Set up alerts via the /api/alerts endpoint");
      console.log("3. View monitoring stats at /api/monitoring?action=stats");
    }
  } catch (error) {
    console.error("❌ Failed to start monitoring system:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  const { shutdownMonitoring } = await import("@/lib/monitoring/init");
  await shutdownMonitoring();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  const { shutdownMonitoring } = await import("@/lib/monitoring/init");
  await shutdownMonitoring();
  process.exit(0);
});

main().catch(console.error);
