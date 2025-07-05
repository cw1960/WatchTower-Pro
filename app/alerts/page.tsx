import { Metadata } from "next";
import { requireWhopAuthForPage } from "@/lib/auth/whop-auth-middleware";
import { db } from "@/lib/db";
import AlertManager from "@/components/alerts/AlertManager";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Alert Management - WatchTower Pro",
  description: "Manage your monitoring alerts and notification preferences",
};

export default async function AlertsPage() {
  try {
    const authResult = await requireWhopAuthForPage();

    if ("redirect" in authResult) {
      redirect(authResult.redirect);
    }

    const { user } = authResult;

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Alert Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your monitoring alerts and notification preferences
              </p>
            </div>
          </div>

          {/* Main Content */}
          <AlertManager
            userId={user.id}
            monitors={monitors}
            userPlan={user.plan}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading alerts page:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to load alerts
          </h1>
          <p className="text-gray-600 mb-6">
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
