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
    color: "slate",
    gradient: "from-slate-500 to-slate-600",
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
    color: "green",
    gradient: "from-green-500 to-emerald-600",
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
    color: "blue",
    gradient: "from-blue-500 to-purple-600",
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
    color: "purple",
    gradient: "from-purple-500 to-pink-600",
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

  const currentPlan = planFeatures[user.plan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-white mb-4 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:text-blue-400" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                💳 Billing & Subscription
              </h1>
              <p className="text-slate-300 mt-2">
                Manage your WatchTower Pro subscription and billing
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${currentPlan.gradient} text-white shadow-lg`}>
                Current Plan: {currentPlan.name}
              </span>
            </div>
          </div>
        </div>

        {/* Current Plan Info */}
        <div className="bg-gradient-to-r from-slate-800/90 via-blue-900/50 to-slate-800/90 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Current Subscription
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg animate-pulse"></div>
              <span className="text-sm text-green-300 font-medium">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">
                {currentPlan.name} Plan
              </h3>
              <p className="text-slate-300">
                {currentPlan.description}
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mt-2">
                {currentPlan.price}
                <span className="text-sm font-normal text-slate-400">
                  /month
                </span>
              </p>
            </div>
            {user.plan !== PlanType.FREE && (
              <button
                onClick={handleCancelSubscription}
                className="px-6 py-3 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-400/30 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-600/30 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(planFeatures).map(([planType, plan]) => (
              <div
                key={planType}
                className={`relative bg-gradient-to-br ${
                  user.plan === planType 
                    ? `from-${plan.color}-600/20 to-${plan.color}-500/20 border-${plan.color}-400/50` 
                    : "from-slate-800/50 to-slate-700/50 border-slate-600/50"
                } backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                {user.plan === planType && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline">
                    <span className={`text-3xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-slate-400 text-sm ml-2">
                      /month
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mr-3 shadow-sm`}>
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-3 border-t border-slate-600/30">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-slate-600/50 flex items-center justify-center mr-3">
                            <XMarkIcon className="w-3 h-3 text-slate-400" />
                          </div>
                          <span className="text-slate-400 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {user.plan === planType ? (
                  <button
                    disabled
                    className={`w-full py-3 px-4 rounded-xl font-medium bg-gradient-to-r ${plan.gradient} text-white shadow-lg cursor-not-allowed opacity-75`}
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(planType as PlanType)}
                    className={`w-full py-3 px-4 rounded-xl font-medium bg-gradient-to-r ${plan.gradient} hover:shadow-xl text-white transition-all duration-200 transform hover:scale-105`}
                  >
                    {planType === PlanType.FREE ? "Downgrade" : "Upgrade"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-gradient-to-r from-slate-800/90 via-blue-900/50 to-slate-800/90 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Billing Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-600/30">
                  <span className="text-slate-300">Email:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-600/30">
                  <span className="text-slate-300">Plan:</span>
                  <span className={`text-${currentPlan.color}-300 font-medium`}>
                    {currentPlan.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-600/30">
                  <span className="text-slate-300">Status:</span>
                  <span className="text-green-300">Active</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Next Steps
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30 rounded-xl">
                  <h4 className="font-medium text-blue-300 mb-2">
                    Need Help?
                  </h4>
                  <p className="text-blue-200 text-sm">
                    Contact our support team if you have any questions about your billing or subscription.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-xl">
                  <h4 className="font-medium text-green-300 mb-2">
                    Manage Usage
                  </h4>
                  <p className="text-green-200 text-sm">
                    Monitor your usage and upgrade when you need more monitoring capacity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
