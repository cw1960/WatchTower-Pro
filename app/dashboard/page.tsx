import Dashboard from "@/components/dashboard/Dashboard";
import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PlanType } from "@prisma/client";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export default async function DashboardPage() {
  try {
    console.log("🔍 DashboardPage: Starting authentication");
    
    // Get headers from the request
    const headersList = await headers();
    
    // Extract the user ID from the verified auth JWT token
    const { userId } = await whopSdk.verifyUserToken(headersList);
    console.log("✅ DashboardPage: User authenticated:", userId);

    // Load the user's public profile information
    const user = await whopSdk.users.getUser({ userId: userId });
    console.log("✅ DashboardPage: User profile loaded:", { userId: user.id, name: user.name });

    // For now, default to STARTER plan since Whop user profile doesn't include plan info
    // TODO: Get actual user plan from our database or Whop business logic
    const userPlan = PlanType.STARTER;

    // Get the authentication token to pass to the client component
    const authToken = headersList.get('x-whop-user-token');

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
        
        <Dashboard userId={user.id} userPlan={userPlan} authToken={authToken} />
      </div>
    );
  } catch (error) {
    console.error("❌ DashboardPage: Authentication failed:", error);
    redirect("/");
  }
}
