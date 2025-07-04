import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import PricingService, {
  Feature,
  NotificationChannel,
  PLAN_CONFIG,
} from "@/lib/pricing";
import { PlanType } from "@prisma/client";

export interface FeatureGateOptions {
  feature: Feature;
  redirectUrl?: string;
  message?: string;
}

export interface UsageLimitOptions {
  type: "monitors" | "alerts";
  redirectUrl?: string;
  allowPartial?: boolean;
}

export interface FrequencyLimitOptions {
  intervalSeconds: number;
  redirectUrl?: string;
}

export interface ChannelGateOptions {
  channel: NotificationChannel;
  redirectUrl?: string;
}

/**
 * Middleware to check if user has access to a specific feature
 */
export async function requireFeature(
  request: NextRequest,
  userId: string,
  options: FeatureGateOptions,
): Promise<NextResponse | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasAccess = PricingService.hasFeatureAccess(
      user.plan as PlanType,
      options.feature,
    );

    if (!hasAccess) {
      const config = PricingService.getPlanConfig(user.plan as PlanType);

      return NextResponse.json(
        {
          error: "Feature not available",
          message:
            options.message ||
            `This feature requires a higher plan. You're currently on the ${config.name} plan.`,
          feature: options.feature,
          currentPlan: user.plan,
          upgradeRequired: true,
          redirectUrl: options.redirectUrl,
        },
        { status: 403 },
      );
    }

    return null; // No error, feature access granted
  } catch (error) {
    console.error("Feature gate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Middleware to check if user can create more resources (monitors, alerts)
 */
export async function requireUsageLimit(
  request: NextRequest,
  userId: string,
  options: UsageLimitOptions,
): Promise<NextResponse | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planType = user.plan as PlanType;
    let result;

    if (options.type === "monitors") {
      result = await PricingService.canCreateMonitor(userId, planType);
    } else {
      result = await PricingService.canCreateAlert(userId, planType);
    }

    if (!result.allowed && !options.allowPartial) {
      const config = PricingService.getPlanConfig(planType);
      const usage = await PricingService.getUserUsage(userId);
      const suggestions = PricingService.getUpgradeSuggestions(planType, usage);

      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          message: result.message,
          currentPlan: user.plan,
          usage: {
            current: result.currentCount,
            limit: result.limit,
            percentage:
              result.limit === -1
                ? 0
                : (result.currentCount / result.limit) * 100,
          },
          upgrade: suggestions,
          upgradeRequired: true,
          redirectUrl: options.redirectUrl,
        },
        { status: 403 },
      );
    }

    return null; // No error, usage within limits
  } catch (error) {
    console.error("Usage limit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Middleware to check if check frequency is allowed for user's plan
 */
export async function requireFrequencyLimit(
  request: NextRequest,
  userId: string,
  options: FrequencyLimitOptions,
): Promise<NextResponse | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planType = user.plan as PlanType;
    const validation = PricingService.isValidCheckFrequency(
      planType,
      options.intervalSeconds,
    );

    if (!validation.valid) {
      const config = PricingService.getPlanConfig(planType);

      return NextResponse.json(
        {
          error: "Check frequency too high",
          message: validation.message,
          currentPlan: user.plan,
          interval: {
            requested: options.intervalSeconds,
            minimum: validation.minInterval,
            minimumMinutes: validation.minInterval / 60,
          },
          upgradeRequired: true,
          redirectUrl: options.redirectUrl,
        },
        { status: 403 },
      );
    }

    return null; // No error, frequency is allowed
  } catch (error) {
    console.error("Frequency limit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Middleware to check if notification channel is allowed for user's plan
 */
export async function requireChannelAccess(
  request: NextRequest,
  userId: string,
  options: ChannelGateOptions,
): Promise<NextResponse | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planType = user.plan as PlanType;
    const hasAccess = PricingService.hasChannelAccess(
      planType,
      options.channel,
    );

    if (!hasAccess) {
      const config = PricingService.getPlanConfig(planType);

      return NextResponse.json(
        {
          error: "Notification channel not available",
          message: `${options.channel} notifications require a higher plan. You're currently on the ${config.name} plan.`,
          channel: options.channel,
          currentPlan: user.plan,
          availableChannels: config.channels,
          upgradeRequired: true,
          redirectUrl: options.redirectUrl,
        },
        { status: 403 },
      );
    }

    return null; // No error, channel access granted
  } catch (error) {
    console.error("Channel gate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Helper function to get user plan information
 */
export async function getUserPlanInfo(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return null;
  }

  const planType = user.plan as PlanType;
  const config = PricingService.getPlanConfig(planType);
  const usage = await PricingService.getUserUsage(userId);
  const suggestions = PricingService.getUpgradeSuggestions(planType, usage);

  return {
    user,
    plan: {
      type: planType,
      config,
      features: Object.keys(config.features).reduce(
        (acc, feature) => {
          acc[feature] = PricingService.hasFeatureAccess(
            planType,
            feature as Feature,
          );
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    },
    usage,
    suggestions,
  };
}

/**
 * Combined middleware that checks multiple restrictions at once
 */
export async function requirePlanAccess(
  request: NextRequest,
  userId: string,
  requirements: {
    features?: Feature[];
    usageChecks?: UsageLimitOptions[];
    frequencyCheck?: FrequencyLimitOptions;
    channelChecks?: ChannelGateOptions[];
  },
): Promise<NextResponse | null> {
  // Check features
  if (requirements.features) {
    for (const feature of requirements.features) {
      const result = await requireFeature(request, userId, { feature });
      if (result) return result;
    }
  }

  // Check usage limits
  if (requirements.usageChecks) {
    for (const usageCheck of requirements.usageChecks) {
      const result = await requireUsageLimit(request, userId, usageCheck);
      if (result) return result;
    }
  }

  // Check frequency limits
  if (requirements.frequencyCheck) {
    const result = await requireFrequencyLimit(
      request,
      userId,
      requirements.frequencyCheck,
    );
    if (result) return result;
  }

  // Check channel access
  if (requirements.channelChecks) {
    for (const channelCheck of requirements.channelChecks) {
      const result = await requireChannelAccess(request, userId, channelCheck);
      if (result) return result;
    }
  }

  return null; // All checks passed
}

/**
 * Utility function to create upgrade response
 */
export function createUpgradeResponse(
  currentPlan: PlanType,
  feature?: string,
  redirectUrl?: string,
) {
  const config = PricingService.getPlanConfig(currentPlan);
  const comparisons = PricingService.getPlanComparison();

  return NextResponse.json(
    {
      error: "Upgrade required",
      message: feature
        ? `${feature} is not available on your current ${config.name} plan.`
        : `Your ${config.name} plan has reached its limits.`,
      currentPlan,
      availablePlans: comparisons.filter((p) => p.plan !== currentPlan),
      redirectUrl: redirectUrl || "/billing/upgrade",
    },
    { status: 402 },
  ); // 402 Payment Required
}

export default {
  requireFeature,
  requireUsageLimit,
  requireFrequencyLimit,
  requireChannelAccess,
  requirePlanAccess,
  getUserPlanInfo,
  createUpgradeResponse,
};
