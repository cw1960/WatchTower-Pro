import { PlanType } from "@prisma/client";
import { db } from "@/lib/db";

// Enhanced plan configuration for WatchTower Pro
export const PLAN_CONFIG = {
  [PlanType.FREE]: {
    name: "Free",
    price: 0,
    billingCycle: "monthly",
    monitors: 3,
    checkFrequency: 60, // minutes
    checksPerHour: 1,
    retention: 7, // days
    alerts: 1,
    teamMembers: 1,
    features: {
      basicMonitoring: true,
      emailAlerts: true,
      slackIntegration: false,
      whopMetrics: false,
      customWebhooks: false,
      apiAccess: false,
      sslMonitoring: false,
      customDomains: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
    channels: ["EMAIL"],
    whopProductId: null, // Free tier - no Whop product
  },
  [PlanType.STARTER]: {
    name: "Basic",
    price: 29,
    billingCycle: "monthly",
    monitors: 25,
    checkFrequency: 10, // minutes
    checksPerHour: 6,
    retention: 30, // days
    alerts: 10,
    teamMembers: 3,
    features: {
      basicMonitoring: true,
      emailAlerts: true,
      slackIntegration: true,
      whopMetrics: true,
      customWebhooks: false,
      apiAccess: false,
      sslMonitoring: true,
      customDomains: false,
      prioritySupport: false,
      advancedAnalytics: true,
    },
    channels: ["EMAIL", "SLACK"],
    whopProductId: "prod_BASIC_PLAN", // Replace with actual Whop product ID
  },
  [PlanType.PROFESSIONAL]: {
    name: "Pro",
    price: 99,
    billingCycle: "monthly",
    monitors: 100,
    checkFrequency: 5, // minutes
    checksPerHour: 12,
    retention: 90, // days
    alerts: 50,
    teamMembers: 10,
    features: {
      basicMonitoring: true,
      emailAlerts: true,
      slackIntegration: true,
      whopMetrics: true,
      customWebhooks: true,
      apiAccess: true,
      sslMonitoring: true,
      customDomains: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    channels: ["EMAIL", "SLACK", "DISCORD", "WEBHOOK", "SMS"],
    whopProductId: "prod_PRO_PLAN", // Replace with actual Whop product ID
  },
  [PlanType.ENTERPRISE]: {
    name: "Enterprise",
    price: 299,
    billingCycle: "monthly",
    monitors: -1, // unlimited
    checkFrequency: 1, // minutes
    checksPerHour: -1, // unlimited
    retention: 365, // days
    alerts: -1, // unlimited
    teamMembers: -1, // unlimited
    features: {
      basicMonitoring: true,
      emailAlerts: true,
      slackIntegration: true,
      whopMetrics: true,
      customWebhooks: true,
      apiAccess: true,
      sslMonitoring: true,
      customDomains: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
    channels: ["EMAIL", "SLACK", "DISCORD", "WEBHOOK", "SMS", "PUSH"],
    whopProductId: "prod_ENTERPRISE_PLAN", // Replace with actual Whop product ID
  },
} as const;

export type Feature =
  | "basicMonitoring"
  | "emailAlerts"
  | "slackIntegration"
  | "whopMetrics"
  | "customWebhooks"
  | "apiAccess"
  | "sslMonitoring"
  | "customDomains"
  | "prioritySupport"
  | "advancedAnalytics";

export type NotificationChannel =
  | "EMAIL"
  | "SLACK"
  | "DISCORD"
  | "WEBHOOK"
  | "SMS"
  | "PUSH";

export class PricingService {
  /**
   * Get plan configuration for a given plan type
   */
  static getPlanConfig(planType: PlanType) {
    return PLAN_CONFIG[planType];
  }

  /**
   * Check if a user has access to a specific feature
   */
  static hasFeatureAccess(planType: PlanType, feature: Feature): boolean {
    const config = PLAN_CONFIG[planType];
    return (config.features as any)[feature] || false;
  }

  /**
   * Check if a user can use a specific notification channel
   */
  static hasChannelAccess(
    planType: PlanType,
    channel: NotificationChannel,
  ): boolean {
    const config = PLAN_CONFIG[planType];
    return (config.channels as readonly string[]).includes(channel);
  }

  /**
   * Check if user can create more monitors
   */
  static async canCreateMonitor(
    userId: string,
    planType: PlanType,
  ): Promise<{
    allowed: boolean;
    currentCount: number;
    limit: number;
    message?: string;
  }> {
    const config = PLAN_CONFIG[planType];

    const currentCount = await db.monitor.count({
      where: { userId },
    });

    if (config.monitors === -1) {
      return { allowed: true, currentCount, limit: -1 };
    }

    const allowed = currentCount < config.monitors;

    return {
      allowed,
      currentCount,
      limit: config.monitors,
      message: allowed
        ? undefined
        : `You've reached the limit of ${config.monitors} monitors for your ${config.name} plan. Upgrade to create more monitors.`,
    };
  }

  /**
   * Check if user can create more alerts
   */
  static async canCreateAlert(
    userId: string,
    planType: PlanType,
  ): Promise<{
    allowed: boolean;
    currentCount: number;
    limit: number;
    message?: string;
  }> {
    const config = PLAN_CONFIG[planType];

    const currentCount = await db.alert.count({
      where: { userId },
    });

    if (config.alerts === -1) {
      return { allowed: true, currentCount, limit: -1 };
    }

    const allowed = currentCount < config.alerts;

    return {
      allowed,
      currentCount,
      limit: config.alerts,
      message: allowed
        ? undefined
        : `You've reached the limit of ${config.alerts} alerts for your ${config.name} plan. Upgrade to create more alerts.`,
    };
  }

  /**
   * Get minimum check frequency for a plan
   */
  static getMinCheckFrequency(planType: PlanType): number {
    const config = PLAN_CONFIG[planType];
    return config.checkFrequency * 60; // Convert minutes to seconds
  }

  /**
   * Validate check frequency for a plan
   */
  static isValidCheckFrequency(
    planType: PlanType,
    intervalSeconds: number,
  ): {
    valid: boolean;
    minInterval: number;
    message?: string;
  } {
    const minInterval = this.getMinCheckFrequency(planType);
    const valid = intervalSeconds >= minInterval;

    return {
      valid,
      minInterval,
      message: valid
        ? undefined
        : `Check frequency too high for your plan. Minimum interval is ${minInterval / 60} minutes.`,
    };
  }

  /**
   * Get usage statistics for a user
   */
  static async getUserUsage(userId: string): Promise<{
    monitors: number;
    alerts: number;
    notifications: number;
    checks: number;
  }> {
    const [monitors, alerts, notifications, checks] = await Promise.all([
      db.monitor.count({ where: { userId } }),
      db.alert.count({ where: { userId } }),
      db.notification.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      }),
      db.monitorCheck.count({
        where: {
          monitor: { userId },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      }),
    ]);

    return { monitors, alerts, notifications, checks };
  }

  /**
   * Get upgrade suggestions for a user
   */
  static getUpgradeSuggestions(
    currentPlan: PlanType,
    usage: {
      monitors: number;
      alerts: number;
    },
  ): {
    shouldUpgrade: boolean;
    suggestedPlan?: PlanType;
    reasons: string[];
  } {
    const config = PLAN_CONFIG[currentPlan];
    const reasons: string[] = [];
    let shouldUpgrade = false;
    let suggestedPlan: PlanType | undefined;

    // Check if approaching limits
    if (config.monitors !== -1 && usage.monitors >= config.monitors * 0.8) {
      reasons.push(
        `You're using ${usage.monitors}/${config.monitors} monitors (${Math.round((usage.monitors / config.monitors) * 100)}%)`,
      );
      shouldUpgrade = true;
    }

    if (config.alerts !== -1 && usage.alerts >= config.alerts * 0.8) {
      reasons.push(
        `You're using ${usage.alerts}/${config.alerts} alerts (${Math.round((usage.alerts / config.alerts) * 100)}%)`,
      );
      shouldUpgrade = true;
    }

    // Suggest appropriate upgrade
    if (shouldUpgrade) {
      if (currentPlan === PlanType.FREE) {
        suggestedPlan = PlanType.STARTER;
      } else if (currentPlan === PlanType.STARTER) {
        suggestedPlan = PlanType.PROFESSIONAL;
      } else if (currentPlan === PlanType.PROFESSIONAL) {
        suggestedPlan = PlanType.ENTERPRISE;
      }
    }

    return { shouldUpgrade, suggestedPlan, reasons };
  }

  /**
   * Calculate cost for upgrading to a new plan
   */
  static calculateUpgradeCost(
    currentPlan: PlanType,
    newPlan: PlanType,
    daysRemaining = 30,
  ): {
    currentMonthlyPrice: number;
    newMonthlyPrice: number;
    proratedCost: number;
    totalSavings?: number;
  } {
    const currentConfig = PLAN_CONFIG[currentPlan];
    const newConfig = PLAN_CONFIG[newPlan];

    const proratedCost =
      (newConfig.price - currentConfig.price) * (daysRemaining / 30);

    return {
      currentMonthlyPrice: currentConfig.price,
      newMonthlyPrice: newConfig.price,
      proratedCost: Math.max(0, proratedCost),
      totalSavings:
        newConfig.price > currentConfig.price
          ? undefined
          : (currentConfig.price - newConfig.price) * 12,
    };
  }

  /**
   * Get plan comparison data
   */
  static getPlanComparison(): Array<{
    plan: PlanType;
    config: (typeof PLAN_CONFIG)[PlanType];
    popular?: boolean;
    recommended?: boolean;
  }> {
    return [
      {
        plan: PlanType.FREE,
        config: PLAN_CONFIG[PlanType.FREE],
      },
      {
        plan: PlanType.STARTER,
        config: PLAN_CONFIG[PlanType.STARTER],
        popular: true,
      },
      {
        plan: PlanType.PROFESSIONAL,
        config: PLAN_CONFIG[PlanType.PROFESSIONAL],
        recommended: true,
      },
      {
        plan: PlanType.ENTERPRISE,
        config: PLAN_CONFIG[PlanType.ENTERPRISE],
      },
    ];
  }

  /**
   * Check if plan allows Whop metrics monitoring
   */
  static allowsWhopMetrics(planType: PlanType): boolean {
    return this.hasFeatureAccess(planType, "whopMetrics");
  }

  /**
   * Get plan benefits for marketing/upgrade prompts
   */
  static getPlanBenefits(planType: PlanType): string[] {
    const config = PLAN_CONFIG[planType];
    const benefits: string[] = [];

    if (config.monitors === -1) {
      benefits.push("Unlimited monitors");
    } else {
      benefits.push(`Up to ${config.monitors} monitors`);
    }

    benefits.push(`${config.checkFrequency}-minute check frequency`);
    benefits.push(`${config.retention}-day data retention`);

    if (config.features.slackIntegration) benefits.push("Slack integration");
    if (config.features.whopMetrics) benefits.push("Whop business metrics");
    if (config.features.customWebhooks) benefits.push("Custom webhooks");
    if (config.features.apiAccess) benefits.push("API access");
    if (config.features.prioritySupport) benefits.push("Priority support");
    if (config.features.advancedAnalytics) benefits.push("Advanced analytics");

    return benefits;
  }
}

export default PricingService;
