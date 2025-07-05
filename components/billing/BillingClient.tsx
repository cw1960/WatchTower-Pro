"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlanType } from "@prisma/client";

const planFeatures = {
  [PlanType.FREE]: {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out WatchTower Pro",
    features: [
      "1 monitor",
      "5-minute check frequency",
      "Email notifications",
      "Basic uptime monitoring",
      "Community support",
    ],
    limitations: [
      "No SSL monitoring",
      "No advanced alerts",
      "No Discord integration",
      "No custom webhooks",
      "No API access",
    ],
  },
  [PlanType.STARTER]: {
    name: "Starter",
    price: "$9.99",
    description: "Great for small websites and projects",
    features: [
      "5 monitors",
      "1-minute check frequency",
      "Email & push notifications",
      "SSL certificate monitoring",
      "Basic incident management",
      "Email support",
    ],
    limitations: [
      "No Discord integration",
      "No custom webhooks",
      "No SMS notifications",
      "Limited API access",
    ],
  },
  [PlanType.PROFESSIONAL]: {
    name: "Professional",
    price: "$29.99",
    description: "Perfect for growing businesses",
    features: [
      "25 monitors",
      "30-second check frequency",
      "All notification channels",
      "Advanced alert conditions",
      "Discord & webhook integration",
      "Priority support",
      "Custom status page",
    ],
    limitations: ["No SMS notifications", "Standard API limits"],
  },
  [PlanType.ENTERPRISE]: {
    name: "Enterprise",
    price: "$99.99",
    description: "For teams and large organizations",
    features: [
      "Unlimited monitors",
      "15-second check frequency",
      "All notification channels",
      "SMS notifications",
      "Custom integrations",
      "Dedicated support",
      "White-label options",
      "Advanced analytics",
      "Team management",
    ],
    limitations: [],
  },
};

interface BillingClientProps {
  user: {
    id: string;
    plan: PlanType;
    email: string;
  };
}

export default function BillingClient({ user }: BillingClientProps) {
  const handleUpgrade = async (planType: PlanType) => {
    if (planType === user.plan) return;

    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to create checkout session. Please try again.");
    }
  };

  const handleCancelSubscription = async () => {
    if (user.plan === PlanType.FREE) return;

    if (
      !confirm(
        "Are you sure you want to cancel your subscription? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      const result = await response.json();
      alert(result.message);
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Billing & Subscription
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your WatchTower Pro subscription and billing
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Current Plan: {planFeatures[user.plan].name}
              </span>
            </div>
          </div>
        </div>

        {/* Current Plan Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Current Subscription
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {planFeatures[user.plan].name} Plan
              </h3>
              <p className="text-gray-600">
                {planFeatures[user.plan].description}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {planFeatures[user.plan].price}
                <span className="text-sm font-normal text-gray-600">
                  /month
                </span>
              </p>
            </div>
            {user.plan !== PlanType.FREE && (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(planFeatures).map(([planType, plan]) => (
              <div
                key={planType}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 relative ${
                  user.plan === planType
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                }`}
              >
                {user.plan === planType && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-600">
                      /month
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Included:
                    </h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Not included:
                      </h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <XMarkIcon className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {user.plan === planType ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : planType === PlanType.FREE ? (
                    <button
                      onClick={() => handleUpgrade(planType as PlanType)}
                      className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Downgrade to Free
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(planType as PlanType)}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {user.plan === PlanType.FREE ? "Upgrade" : "Switch"} to{" "}
                      {plan.name}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Billing Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Plan:</span>
              <span className="text-gray-900">
                {planFeatures[user.plan].name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Cost:</span>
              <span className="text-gray-900">
                {planFeatures[user.plan].price}
              </span>
            </div>
            {user.plan !== PlanType.FREE && (
              <div className="flex justify-between">
                <span className="text-gray-600">Next Billing Date:</span>
                <span className="text-gray-900">
                  {new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
