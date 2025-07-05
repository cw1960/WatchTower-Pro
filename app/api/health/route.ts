import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

export async function GET() {
  const startTime = Date.now();

  try {
    // Database health check
    const dbHealthy = await healthCheck();

    // Basic system info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };

    // Service status
    const services = {
      database: {
        status: dbHealthy ? "healthy" : "unhealthy",
        responseTime: Date.now() - startTime,
      },
      // Add more service checks as needed
    };

    // Overall health
    const isHealthy = dbHealthy;
    const overallStatus = isHealthy ? "healthy" : "unhealthy";

    const response = {
      status: overallStatus,
      timestamp: systemInfo.timestamp,
      environment: systemInfo.environment,
      version: systemInfo.version,
      uptime: systemInfo.uptime,
      services,
      system: systemInfo,
      responseTime: Date.now() - startTime,
    };

    // Log health check
    logger.info("Health check performed", {
      component: "health",
      action: "check",
      metadata: {
        status: overallStatus,
        responseTime: response.responseTime,
        services: Object.keys(services).length,
      },
    });

    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime: Date.now() - startTime,
    };

    logger.error("Health check failed", error as Error, {
      component: "health",
      action: "check_failed",
      metadata: {
        responseTime: errorResponse.responseTime,
      },
    });

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  }
}

// Simple ping endpoint for basic availability checks
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
