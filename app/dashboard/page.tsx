import Dashboard from "@/components/dashboard/Dashboard";
import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";
import { PlanType } from "@prisma/client";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export default async function DashboardPage() {
  try {
    console.log("🔍 DashboardPage: Starting authentication");

    // Use the working authentication system (same as experience page)
    const authResult = await validateWhopAuth();
    console.log("🔍 DashboardPage: Auth result:", {
      success: authResult.success,
      error: authResult.error,
    });

    if (!authResult.success || !authResult.user) {
      console.error(
        "❌ DashboardPage: Authentication failed:",
        authResult.error,
      );
      redirect("/");
    }

    const user = authResult.user;
    console.log("✅ DashboardPage: User authenticated:", {
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

        <Dashboard userId={user.id} userPlan={userPlan} />
      </div>
    );
  } catch (error) {
    console.error("❌ DashboardPage: Error:", error);
    redirect("/");
  }
}
