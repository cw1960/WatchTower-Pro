import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { WhopMonitoringUtils } from "@/lib/monitoring/whop-collector";
import { getMonitoringEngine } from "@/lib/monitoring/engine";
import { whopAuth } from "@/lib/whop-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      companyId,
      name,
      interval,
      accessPassId,
      experienceId,
      alerts = [],
      userId,
    } = body;

    // Validate required fields
    if (!type || !companyId || !name || !interval || !userId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: type, companyId, name, interval, userId",
        },
        { status: 400 },
      );
    }

    // Validate user access (if needed)
    // const hasAccess = await whopAuth.validateUserAccess(userId);
    // if (!hasAccess) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    let whopConfig;
    let monitorName;
    let monitorUrl = `whop://company/${companyId}`;

    // Create appropriate Whop monitor configuration based on type
    switch (type) {
      case "membership":
        whopConfig = WhopMonitoringUtils.createMembershipMonitor(
          companyId,
          experienceId,
        );
        monitorName = `${name} - Membership Monitoring`;
        if (experienceId) {
          monitorUrl += `/experience/${experienceId}`;
        }
        break;

      case "revenue":
        whopConfig = WhopMonitoringUtils.createRevenueMonitor(companyId);
        monitorName = `${name} - Revenue Monitoring`;
        monitorUrl += "/revenue";
        break;

      case "community":
        whopConfig = WhopMonitoringUtils.createCommunityMonitor(companyId);
        monitorName = `${name} - Community Monitoring`;
        monitorUrl += "/community";
        break;

      case "access-pass":
        if (!accessPassId) {
          return NextResponse.json(
            { error: "Access Pass ID is required for access-pass monitoring" },
            { status: 400 },
          );
        }
        whopConfig = WhopMonitoringUtils.createAccessPassMonitor(
          companyId,
          accessPassId,
        );
        monitorName = `${name} - Access Pass Monitoring`;
        monitorUrl += `/access-pass/${accessPassId}`;
        break;

      case "comprehensive":
        whopConfig = WhopMonitoringUtils.createComprehensiveMonitor(
          companyId,
          accessPassId,
        );
        monitorName = `${name} - Comprehensive Whop Monitoring`;
        monitorUrl += "/comprehensive";
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid monitor type. Supported types: membership, revenue, community, access-pass, comprehensive",
          },
          { status: 400 },
        );
    }

    // Create monitor in database
    const monitor = await db.monitor.create({
      data: {
        name: monitorName,
        url: monitorUrl,
        type: "WHOP_METRICS",
        status: "ACTIVE",
        interval: interval * 60, // Convert minutes to seconds
        timeout: 30, // 30 seconds timeout
        retries: 3,
        method: "GET",
        headers: undefined,
        whopMetrics: JSON.stringify(whopConfig),
        companyId: companyId,
        userId: userId,
      },
    });

    // Add alerts if provided
    if (alerts.length > 0) {
      await Promise.all(
        alerts.map((alert: any) =>
          db.alert.create({
            data: {
              ...alert,
              monitorId: monitor.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
        ),
      );
    }

    // Add to monitoring engine
    const engine = getMonitoringEngine();
    await engine.createMonitor(monitor);

    // Return created monitor with full details
    const fullMonitor = await db.monitor.findUnique({
      where: { id: monitor.id },
      include: {
        alerts: true,
        checks: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      monitor: fullMonitor,
      whopConfig,
      message: `Whop ${type} monitor created successfully`,
    });
  } catch (error) {
    console.error("Error creating Whop monitor:", error);
    return NextResponse.json(
      { error: "Failed to create Whop monitor" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const type = searchParams.get("type");

    // Build query filters
    const where: any = {
      type: "WHOP_METRICS",
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (type) {
      where.tags = type;
    }

    // Get Whop monitors
    const monitors = await db.monitor.findMany({
      where,
      include: {
        alerts: true,
        checks: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse Whop configurations
    const monitorsWithConfig = monitors.map((monitor) => ({
      ...monitor,
      whopConfig: monitor.whopMetrics
        ? JSON.parse(monitor.whopMetrics as string)
        : null,
      lastCheck: monitor.checks[0] || null,
      recentChecks: monitor.checks,
    }));

    return NextResponse.json({
      success: true,
      monitors: monitorsWithConfig,
      total: monitors.length,
    });
  } catch (error) {
    console.error("Error fetching Whop monitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch Whop monitors" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Monitor ID is required" },
        { status: 400 },
      );
    }

    // Update monitor
    const monitor = await db.monitor.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    // Update in monitoring engine
    const engine = getMonitoringEngine();
    await engine.updateMonitor(id, monitor);

    return NextResponse.json({
      success: true,
      monitor,
      message: "Whop monitor updated successfully",
    });
  } catch (error) {
    console.error("Error updating Whop monitor:", error);
    return NextResponse.json(
      { error: "Failed to update Whop monitor" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Monitor ID is required" },
        { status: 400 },
      );
    }

    // Delete from monitoring engine first
    const engine = getMonitoringEngine();
    await engine.deleteMonitor(id);

    return NextResponse.json({
      success: true,
      message: "Whop monitor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Whop monitor:", error);
    return NextResponse.json(
      { error: "Failed to delete Whop monitor" },
      { status: 500 },
    );
  }
}
