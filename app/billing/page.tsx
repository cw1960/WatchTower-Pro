"use client";

import React, { useState } from "react";
import { RequireAuth, useWhopUser } from "@/lib/context/WhopUserContext";
import { PlanType } from "@prisma/client";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    limitations: [
      "No SMS notifications",
      "Standard API limits",
    ],
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

export default function BillingPage() {
  const { user, updateUserPlan } = useWhopUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleUpgrade = async (planType: PlanType) => {
    if (!user || planType === user.plan) return;

    setLoading(planType);
    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || user.plan === PlanType.FREE) return;

    setCancelling(true);
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const result = await response.json();
      alert(result.message);
      
      // Update user plan locally
      await updateUserPlan(PlanType.FREE);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
                  <p className="mt-2 text-gray-600">Manage your WatchTower Pro subscription</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Current Plan: {planFeatures[user.plan].name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Current Plan Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{planFeatures[user.plan].name} Plan</h3>
                <p className="text-gray-600">{planFeatures[user.plan].description}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {planFeatures[user.plan].price}
                  {user.plan !== PlanType.FREE && <span className="text-sm font-normal text-gray-500">/month</span>}
                </p>
              </div>
              {user.plan !== PlanType.FREE && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(planFeatures).map(([planType, plan]) => (
              <div
                key={planType}
                className={`bg-white rounded-lg shadow-sm border p-6 relative ${
                  user.plan === planType ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {user.plan === planType && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                      Current
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {planType !== PlanType.FREE && <span className="text-sm text-gray-500">/month</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center">
                      <XMarkIcon className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(planType as PlanType)}
                  disabled={
                    user.plan === planType || 
                    loading === planType ||
                    (planType === PlanType.FREE && user.plan !== PlanType.FREE)
                  }
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    user.plan === planType
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : planType === PlanType.FREE
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading === planType ? (
                    'Processing...'
                  ) : user.plan === planType ? (
                    'Current Plan'
                  ) : planType === PlanType.FREE ? (
                    'Contact Support'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Billing Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  Your subscription is managed through Whop. All billing inquiries should be directed to Whop support.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Need help?</strong> Contact our support team at support@watchtowerpro.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
