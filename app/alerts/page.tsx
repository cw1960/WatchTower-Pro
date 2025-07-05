import { Metadata } from "next";
import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";
import { db } from "@/lib/db";
import AlertManager from "@/components/alerts/AlertManager";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";
import { PlanType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Alert Management - WatchTower Pro",
  description: "Manage your monitoring alerts and notification preferences",
};

export default async function AlertsPage() {
  try {
    console.log("🔍 AlertsPage: Starting authentication");
    
    const authResult = await validateWhopAuth();

    if (!authResult.success || !authResult.user) {
      console.error("❌ AlertsPage: Authentication failed:", authResult.error);
      redirect("/");
    }

    const user = authResult.user;
    console.log("✅ AlertsPage: User authenticated:", { userId: user.id, name: user.name });

    // Cast the plan string to PlanType enum
    const userPlan = user.plan as PlanType;

    // Get user's monitors
    const monitors = await db.monitor.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Navigation Header */}
        <div className="border-b border-slate-700/50 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-blue-300 hover:text-blue-100 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                WatchTower Pro Home
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Alert Management
              </h1>
              <p className="text-gray-300 mt-2">
                Manage your monitoring alerts and notification preferences
              </p>
            </div>
          </div>

          {/* Main Content */}
          <AlertManager
            userId={user.id}
            monitors={monitors}
            userPlan={userPlan}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ AlertsPage: Error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Unable to load alerts
          </h1>
          <p className="text-gray-300 mb-6">
            There was an error loading your alerts. Please try again.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}
