import { Metadata } from "next";
import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";
import BillingClient from "@/components/billing/BillingClient";
import { PlanType } from "@prisma/client";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Billing & Subscription - WatchTower Pro",
  description: "Manage your WatchTower Pro subscription and billing",
};

export default async function BillingPage() {
  try {
    console.log("🔍 BillingPage: Starting authentication");

    const authResult = await validateWhopAuth();

    if (!authResult.success || !authResult.user) {
      console.error("❌ BillingPage: Authentication failed:", authResult.error);
      redirect("/");
    }

    const user = authResult.user;
    console.log("✅ BillingPage: User authenticated:", {
      userId: user.id,
      name: user.name,
    });

    // Cast the plan string to PlanType enum
    const userPlan = user.plan as PlanType;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Navigation Header */}
        <div className="border-b border-slate-700/50 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-blue-300 hover:text-blue-100 transition-colors"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Back to WatchTower Pro Home
            </Link>
          </div>
        </div>

        <BillingClient
          user={{
            id: user.id,
            plan: userPlan,
            email: user.email,
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("❌ BillingPage: Error:", error);
    redirect("/");
  }
}
