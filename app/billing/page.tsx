import { Metadata } from "next";
import { requireWhopAuthForPage } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";
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

export const metadata: Metadata = {
  title: "Billing & Subscription - WatchTower Pro",
  description: "Manage your WatchTower Pro subscription and billing",
};

interface BillingClientProps {
  user: {
    id: string;
    plan: PlanType;
    email: string;
  };
}

function BillingClient({ user }: BillingClientProps) {
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
              <p className="text-gray-600 mt-1">
                {planFeatures[user.plan].description}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {planFeatures[user.plan].price}
                {user.plan !== PlanType.FREE && (
                  <span className="text-sm font-normal text-gray-500">
                    /month
                  </span>
                )}
              </p>
            </div>
            {user.plan !== PlanType.FREE && (
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(planFeatures).map(([planType, plan]) => (
              <div
                key={planType}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                  user.plan === planType
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    {user.plan === planType && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-3xl font-bold text-gray-900">
                      {plan.price}
                      {planType !== PlanType.FREE && (
                        <span className="text-sm font-normal text-gray-500">
                          /month
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start">
                        <XMarkIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-400">
                          {limitation}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpgrade(planType as PlanType)}
                    disabled={user.plan === planType}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      user.plan === planType
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : planType === PlanType.ENTERPRISE
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {user.plan === planType
                      ? "Current Plan"
                      : planType === PlanType.FREE
                        ? "Downgrade"
                        : "Upgrade"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Feature
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    Free
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    Starter
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    Professional
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">Monitors</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    1
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    5
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    25
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    Check Frequency
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    5 min
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    1 min
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    30 sec
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    15 sec
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    SSL Monitoring
                  </td>
                  <td className="py-3 px-4 text-center">
                    <XMarkIcon className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    SMS Notifications
                  </td>
                  <td className="py-3 px-4 text-center">
                    <XMarkIcon className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <XMarkIcon className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <XMarkIcon className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    Team Management
                  </td>
                  <td className="py-3 px-4 text-center">
                    <XMarkIcon className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <XMarkIcon className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <XMarkIcon className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">Support</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    Community
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    Email
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    Priority
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    Dedicated
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BillingPage() {
  const result = await requireWhopAuthForPage();

  if ("redirect" in result) {
    redirect(result.redirect);
  }

  const { user } = result;

  return <BillingClient user={user} />;
}
