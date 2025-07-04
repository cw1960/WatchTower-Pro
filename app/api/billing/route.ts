import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopAuth, whopPricing, PlanType } from "@/lib/whop-sdk";
import PricingService from "@/lib/pricing";
import {
  requireFeature,
  requireUsageLimit,
  getUserPlanInfo,
} from "@/lib/middleware/pricing-middleware";

// GET /api/billing - Get billing information for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with usage statistics
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            monitors: true,
            alerts: true,
            notifications: true,
          },
        },
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                plan: true,
                subscriptionId: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planType = user.plan as PlanType;
    const limits = whopPricing.getPlanLimits(planType);

    // Get usage statistics for the current month
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyNotifications = await db.notification.count({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const monthlyChecks = await db.monitorCheck.count({
      where: {
        monitor: {
          userId,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const billingInfo = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      plan: {
        type: planType,
        limits,
        features: {
          basic_monitoring: whopPricing.hasFeatureAccess(
            planType,
            "basic_monitoring",
          ),
          email_alerts: whopPricing.hasFeatureAccess(planType, "email_alerts"),
          slack_integration: whopPricing.hasFeatureAccess(
            planType,
            "slack_integration",
          ),
          whop_metrics: whopPricing.hasFeatureAccess(planType, "whop_metrics"),
          custom_webhooks: whopPricing.hasFeatureAccess(
            planType,
            "custom_webhooks",
          ),
          api_access: whopPricing.hasFeatureAccess(planType, "api_access"),
        },
      },
      usage: {
        monitors: {
          current: user._count.monitors,
          limit: limits.monitors,
          percentage:
            limits.monitors === -1
              ? 0
              : (user._count.monitors / limits.monitors) * 100,
        },
        alerts: {
          current: user._count.alerts,
          limit: limits.alerts,
          percentage:
            limits.alerts === -1
              ? 0
              : (user._count.alerts / limits.alerts) * 100,
        },
        monthly_notifications: {
          current: monthlyNotifications,
          limit: limits.checks_per_hour * 24 * 30, // Rough estimate
        },
        monthly_checks: {
          current: monthlyChecks,
          limit: limits.checks_per_hour * 24 * 30,
        },
        retention_days: limits.retention_days,
      },
      companies: user.companies.map((cu: any) => cu.company),
    };

    return NextResponse.json(billingInfo);
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/billing - Update user plan or subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, planType, subscriptionId, companyId } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 },
      );
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "update_plan":
        if (!planType || !Object.values(PlanType).includes(planType)) {
          return NextResponse.json(
            { error: "Valid plan type is required" },
            { status: 400 },
          );
        }

        const updatedUser = await db.user.update({
          where: { id: userId },
          data: { plan: planType },
        });

        return NextResponse.json({
          message: "Plan updated successfully",
          user: {
            id: updatedUser.id,
            plan: updatedUser.plan,
          },
        });

      case "update_subscription":
        if (!subscriptionId) {
          return NextResponse.json(
            { error: "Subscription ID is required" },
            { status: 400 },
          );
        }

        // Update user subscription info
        const updatedUserSub = await db.user.update({
          where: { id: userId },
          data: {
            // Add subscription-related fields if needed
            updatedAt: new Date(),
          },
        });

        // If company is provided, update company subscription
        if (companyId) {
          await db.company.update({
            where: { id: companyId },
            data: {
              subscriptionId,
              updatedAt: new Date(),
            },
          });
        }

        return NextResponse.json({
          message: "Subscription updated successfully",
          subscriptionId,
        });

      case "cancel_subscription":
        // Handle subscription cancellation
        if (companyId) {
          await db.company.update({
            where: { id: companyId },
            data: {
              subscriptionId: null,
              plan: PlanType.FREE,
              updatedAt: new Date(),
            },
          });
        }

        await db.user.update({
          where: { id: userId },
          data: {
            plan: PlanType.FREE,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          message: "Subscription cancelled successfully",
        });

      case "create_upgrade_session":
        if (!planType || !Object.values(PlanType).includes(planType)) {
          return NextResponse.json(
            { error: "Valid plan type is required" },
            { status: 400 },
          );
        }

        const currentUser = await db.user.findUnique({
          where: { id: userId },
          select: { plan: true },
        });

        if (!currentUser) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }

        const currentPlan = currentUser.plan as PlanType;
        const targetPlan = planType as PlanType;

        // Calculate upgrade costs
        const costCalculation = PricingService.calculateUpgradeCost(
          currentPlan,
          targetPlan,
        );
        const config = PricingService.getPlanConfig(targetPlan);

        // Create Whop checkout session
        const upgradeSession = await whopPricing.createCheckoutSession({
          userId,
          planType: targetPlan,
          productId: config.whopProductId,
          successUrl: `${request.nextUrl.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${request.nextUrl.origin}/billing/upgrade`,
          metadata: {
            userId,
            currentPlan,
            targetPlan,
            upgradeType: "plan_upgrade",
          },
        });

        return NextResponse.json({
          sessionId: upgradeSession.id,
          checkoutUrl: upgradeSession.url,
          planType: targetPlan,
          cost: costCalculation,
          benefits: PricingService.getPlanBenefits(targetPlan),
        });

      case "preview_upgrade":
        if (!planType || !Object.values(PlanType).includes(planType)) {
          return NextResponse.json(
            { error: "Valid plan type is required" },
            { status: 400 },
          );
        }

        const previewUser = await db.user.findUnique({
          where: { id: userId },
          select: { plan: true },
        });

        if (!previewUser) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }

        const currentPlanType = previewUser.plan as PlanType;
        const targetPlanType = planType as PlanType;

        const preview = {
          current: {
            plan: currentPlanType,
            config: PricingService.getPlanConfig(currentPlanType),
            benefits: PricingService.getPlanBenefits(currentPlanType),
          },
          target: {
            plan: targetPlanType,
            config: PricingService.getPlanConfig(targetPlanType),
            benefits: PricingService.getPlanBenefits(targetPlanType),
          },
          cost: PricingService.calculateUpgradeCost(
            currentPlanType,
            targetPlanType,
          ),
          comparison: PricingService.getPlanComparison(),
        };

        return NextResponse.json(preview);

      case "get_checkout_url":
        if (!planType || !Object.values(PlanType).includes(planType)) {
          return NextResponse.json(
            { error: "Valid plan type is required" },
            { status: 400 },
          );
        }

        // Generate checkout URL with Whop
        const checkoutUrl = whopPricing.generateCheckoutUrl(planType, userId);

        return NextResponse.json({
          checkoutUrl,
          planType,
          pricing: whopPricing.getPlanLimits(planType),
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating billing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Note: Plans data can be moved to a separate /api/billing/plans route later
