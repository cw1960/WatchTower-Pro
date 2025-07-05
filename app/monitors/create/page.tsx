import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";
import MonitorCreatorWrapper from "@/components/monitors/MonitorCreatorWrapper";
import Link from "next/link";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";
import { PlanType } from "@prisma/client";

export default async function CreateMonitorPage() {
  try {
    console.log("🔍 CreateMonitorPage: Starting authentication");
    
    const authResult = await validateWhopAuth();

    if (!authResult.success || !authResult.user) {
      console.error("❌ CreateMonitorPage: Authentication failed:", authResult.error);
      redirect("/");
    }

    const user = authResult.user;
    console.log("✅ CreateMonitorPage: User authenticated:", { userId: user.id, name: user.name });

    // Cast the plan string to PlanType enum
    const userPlan = user.plan as PlanType;

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
              <h1 className="text-3xl font-bold text-white">Create Monitor</h1>
              <p className="text-gray-300 mt-2">
                Set up monitoring for your websites and services
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl">
            <MonitorCreatorWrapper
              userId={user.id}
              userPlan={userPlan}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ CreateMonitorPage: Error:", error);
    redirect("/");
  }
}
