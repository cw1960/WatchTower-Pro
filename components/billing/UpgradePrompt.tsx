"use client";

import { useState, useEffect } from "react";
import { PlanType } from "@prisma/client";

interface UpgradePromptProps {
  currentPlan: PlanType;
  userId: string;
  feature?: string;
  className?: string;
  onUpgrade?: (plan: PlanType) => void;
}

interface PlanConfig {
  name: string;
  price: number;
  monitors: number;
  checkFrequency: number;
  retention: number;
  alerts: number;
  features: Record<string, boolean>;
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

export default function UpgradePrompt({
  currentPlan,
  userId,
  feature,
  className = "",
  onUpgrade,
}: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (targetPlan: PlanType) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: "create_upgrade_session",
          planType: targetPlan,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (onUpgrade) {
          onUpgrade(targetPlan);
        } else {
          // Redirect to Whop checkout
          window.location.href = data.checkoutUrl;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create upgrade session");
      }
    } catch (err) {
      setError("An error occurred while processing your upgrade");
      console.error("Upgrade error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getNextPlan = () => {
    switch (currentPlan) {
      case PlanType.FREE:
        return PlanType.STARTER;
      case PlanType.STARTER:
        return PlanType.PROFESSIONAL;
      case PlanType.PROFESSIONAL:
        return PlanType.ENTERPRISE;
      default:
        return null;
    }
  };

  const nextPlan = getNextPlan();
  if (!nextPlan) return null;

  const currentConfig = PLAN_DETAILS[currentPlan];
  const nextConfig = PLAN_DETAILS[nextPlan];

  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {feature ? `${feature} requires an upgrade` : "Upgrade your plan"}
          </h3>

          <p className="text-gray-600 mb-4">
            {feature
              ? `${feature} is not available on your current ${currentConfig.name} plan. Upgrade to ${nextConfig.name} to unlock this feature.`
              : `You're currently on the ${currentConfig.name} plan. Upgrade to ${nextConfig.name} for more features and higher limits.`}
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">
                Current: {currentConfig.name}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  •{" "}
                  {currentConfig.monitors === -1
                    ? "Unlimited"
                    : currentConfig.monitors}{" "}
                  monitors
                </li>
                <li>• {currentConfig.checkFrequency}-minute check frequency</li>
                <li>• {currentConfig.retention}-day data retention</li>
                <li>
                  •{" "}
                  {currentConfig.alerts === -1
                    ? "Unlimited"
                    : currentConfig.alerts}{" "}
                  alerts
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Upgrade to: {nextConfig.name}
                <span className="ml-2 text-blue-600 font-bold">
                  ${nextConfig.price}/month
                </span>
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  •{" "}
                  {nextConfig.monitors === -1
                    ? "Unlimited"
                    : nextConfig.monitors}{" "}
                  monitors
                </li>
                <li>• {nextConfig.checkFrequency}-minute check frequency</li>
                <li>• {nextConfig.retention}-day data retention</li>
                <li>
                  • {nextConfig.alerts === -1 ? "Unlimited" : nextConfig.alerts}{" "}
                  alerts
                </li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleUpgrade(nextPlan)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? "Processing..." : `Upgrade to ${nextConfig.name}`}
            </button>

            <button
              onClick={() => (window.location.href = "/billing")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              View All Plans
            </button>
          </div>
        </div>

        <div className="ml-4">
          <button
            onClick={() => {
              const prompt = document.querySelector("[data-upgrade-prompt]");
              if (prompt) prompt.remove();
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Dismiss"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to show upgrade prompt dynamically
export function showUpgradePrompt(options: {
  currentPlan: PlanType;
  userId: string;
  feature?: string;
  containerId?: string;
}) {
  const {
    currentPlan,
    userId,
    feature,
    containerId = "upgrade-prompt-container",
  } = options;

  // Create container if it doesn't exist
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.className = "fixed top-4 right-4 z-50 max-w-md";
    document.body.appendChild(container);
  }

  // Create and mount the component
  const promptElement = document.createElement("div");
  promptElement.setAttribute("data-upgrade-prompt", "true");
  promptElement.className = "mb-4";

  container.appendChild(promptElement);

  // This would need React rendering in a real implementation
  // For now, we'll create a simple HTML version
  promptElement.innerHTML = `
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            ${feature ? `${feature} requires an upgrade` : "Upgrade your plan"}
          </h3>
          <p class="text-gray-600 mb-4">
            ${
              feature
                ? `${feature} is not available on your current plan. Upgrade to unlock this feature.`
                : "Upgrade your plan for more features and higher limits."
            }
          </p>
          <div class="flex gap-3">
            <button onclick="window.location.href='/billing/upgrade'" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Upgrade Now
            </button>
            <button onclick="window.location.href='/billing'" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
              View All Plans
            </button>
          </div>
        </div>
        <div class="ml-4">
          <button onclick="this.closest('[data-upgrade-prompt]').remove()" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (promptElement.parentNode) {
      promptElement.remove();
    }
  }, 10000);
}
