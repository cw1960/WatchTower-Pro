"use client";

import { useState, useEffect } from "react";
import { PlanType } from "@prisma/client";

interface PlanConfig {
  name: string;
  price: number;
  monitors: number;
  checkFrequency: number;
  retention: number;
  alerts: number;
  features: Record<string, boolean>;
}

interface UsageData {
  monitors: number;
  alerts: number;
  notifications: number;
  checks: number;
}

interface BillingData {
  user: {
    id: string;
    plan: PlanType;
    name: string;
    email: string;
  };
  usage: UsageData;
  suggestions: {
    shouldUpgrade: boolean;
    suggestedPlan?: PlanType;
    reasons: string[];
  };
}

const PLAN_DETAILS = {
  [PlanType.FREE]: {
    name: "Free",
    price: 0,
    monitors: 3,
    checkFrequency: 60,
    retention: 7,
    alerts: 1,
    features: {
      basicMonitoring: true,
      emailAlerts: true,
      slackIntegration: false,
      whopMetrics: false,
      customWebhooks: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  [PlanType.STARTER]: {
    name: "Basic",
    price: 29,
    monitors: 25,
    checkFrequency: 10,
    retention: 30,
    alerts: 10,
    features: {
      basicMonitoring: true,
      emailAlerts: true,
      slackIntegration: true,
      whopMetrics: true,
      customWebhooks: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  [PlanType.PROFESSIONAL]: {
    name: "Pro",
    price: 99,
    monitors: 100,
    checkFrequency: 5,
    retention: 90,
    alerts: 50,
    features: {
      basicMonitoring: true,
      emailAlerts: true,
      slackIntegration: true,
      whopMetrics: true,
      customWebhooks: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
  [PlanType.ENTERPRISE]: {
    name: "Enterprise",
    price: 299,
    monitors: -1,
    checkFrequency: 1,
    retention: 365,
    alerts: -1,
    features: {
      basicMonitoring: true,
      emailAlerts: true,
      slackIntegration: true,
      whopMetrics: true,
      customWebhooks: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
};

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // In a real implementation, you'd get the user ID from auth context
      const userId = "current-user-id"; // Replace with actual user ID

      const response = await fetch(`/api/billing?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBillingData(data);
      } else {
        setError("Failed to load billing information");
      }
    } catch (err) {
      setError("An error occurred while loading billing data");
      console.error("Billing fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (targetPlan: PlanType) => {
    if (!billingData) return;

    setUpgrading(targetPlan);
    setError(null);

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: billingData.user.id,
          action: "create_upgrade_session",
          planType: targetPlan,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Whop checkout
        window.location.href = data.checkoutUrl;
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create upgrade session");
      }
    } catch (err) {
      setError("An error occurred while processing your upgrade");
      console.error("Upgrade error:", err);
    } finally {
      setUpgrading(null);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const renderFeatureIcon = (enabled: boolean) => {
    return enabled ? (
      <svg
        className="w-4 h-4 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  };

  const renderUsageBar = (current: number, limit: number, label: string) => {
    const percentage = getUsagePercentage(current, limit);
    const isNearLimit = percentage >= 80;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span
            className={`font-medium ${isNearLimit ? "text-red-600" : "text-gray-900"}`}
          >
            {current}/{limit === -1 ? "∞" : limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isNearLimit ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {isNearLimit && (
          <p className="text-xs text-red-600 mt-1">
            You're approaching your {label.toLowerCase()} limit
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No billing data available</p>
      </div>
    );
  }

  const currentPlan = billingData.user.plan;
  const currentConfig = PLAN_DETAILS[currentPlan];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
          <p className="text-gray-600 mt-2">
            Manage your WatchTower Pro subscription and usage
          </p>
        </div>

        {/* Current Plan & Usage */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Plan
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {currentConfig.name}
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {currentConfig.price === 0
                    ? "Free"
                    : `$${currentConfig.price}/month`}
                </p>
              </div>
              {currentPlan !== PlanType.ENTERPRISE && (
                <button
                  onClick={() => {
                    const nextPlan =
                      currentPlan === PlanType.FREE
                        ? PlanType.STARTER
                        : currentPlan === PlanType.STARTER
                          ? PlanType.PROFESSIONAL
                          : PlanType.ENTERPRISE;
                    handleUpgrade(nextPlan);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monitors</span>
                <span>
                  {currentConfig.monitors === -1
                    ? "Unlimited"
                    : currentConfig.monitors}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Check Frequency</span>
                <span>{currentConfig.checkFrequency} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Data Retention</span>
                <span>{currentConfig.retention} days</span>
              </div>
              <div className="flex justify-between">
                <span>Alerts</span>
                <span>
                  {currentConfig.alerts === -1
                    ? "Unlimited"
                    : currentConfig.alerts}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage</h2>
            {renderUsageBar(
              billingData.usage.monitors,
              currentConfig.monitors,
              "Monitors",
            )}
            {renderUsageBar(
              billingData.usage.alerts,
              currentConfig.alerts,
              "Alerts",
            )}

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-2">This Month</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Notifications Sent</span>
                  <span>{billingData.usage.notifications}</span>
                </div>
                <div className="flex justify-between">
                  <span>Checks Performed</span>
                  <span>{billingData.usage.checks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Suggestions */}
        {billingData.suggestions.shouldUpgrade && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Consider Upgrading Your Plan
            </h2>
            <div className="space-y-1 mb-4">
              {billingData.suggestions.reasons.map((reason, index) => (
                <p key={index} className="text-gray-600">
                  • {reason}
                </p>
              ))}
            </div>
            {billingData.suggestions.suggestedPlan && (
              <button
                onClick={() =>
                  handleUpgrade(billingData.suggestions.suggestedPlan!)
                }
                disabled={upgrading === billingData.suggestions.suggestedPlan}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium"
              >
                {upgrading === billingData.suggestions.suggestedPlan
                  ? "Processing..."
                  : `Upgrade to ${PLAN_DETAILS[billingData.suggestions.suggestedPlan].name}`}
              </button>
            )}
          </div>
        )}

        {/* All Plans */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            All Plans
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(PLAN_DETAILS).map(([plan, config]) => {
              const planType = plan as PlanType;
              const isCurrentPlan = planType === currentPlan;
              const isUpgrade = planType > currentPlan;

              return (
                <div
                  key={plan}
                  className={`relative border rounded-lg p-6 ${
                    isCurrentPlan
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "bg-white"
                  } ${planType === PlanType.STARTER ? "border-blue-200" : "border-gray-200"}`}
                >
                  {planType === PlanType.STARTER && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {config.name}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {config.price === 0 ? "Free" : `$${config.price}`}
                      {config.price > 0 && (
                        <span className="text-sm text-gray-500">/month</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span>Monitors</span>
                      <span className="font-medium">
                        {config.monitors === -1 ? "Unlimited" : config.monitors}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check Frequency</span>
                      <span className="font-medium">
                        {config.checkFrequency}min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Retention</span>
                      <span className="font-medium">
                        {config.retention} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alerts</span>
                      <span className="font-medium">
                        {config.alerts === -1 ? "Unlimited" : config.alerts}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      {renderFeatureIcon(config.features.basicMonitoring)}
                      <span>Basic monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderFeatureIcon(config.features.emailAlerts)}
                      <span>Email alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderFeatureIcon(config.features.slackIntegration)}
                      <span>Slack integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderFeatureIcon(config.features.whopMetrics)}
                      <span>Whop metrics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderFeatureIcon(config.features.customWebhooks)}
                      <span>Custom webhooks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderFeatureIcon(config.features.apiAccess)}
                      <span>API access</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-medium"
                      >
                        Current Plan
                      </button>
                    ) : isUpgrade ? (
                      <button
                        onClick={() => handleUpgrade(planType)}
                        disabled={upgrading === planType}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-medium"
                      >
                        {upgrading === planType ? "Processing..." : "Upgrade"}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-400 py-2 rounded-lg font-medium"
                      >
                        Downgrade
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
