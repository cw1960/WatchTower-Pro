import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";

export default async function WhopAppPage() {
  try {
    console.log("🔍 WhopAppPage: Starting authentication");

    // Use the development-mode aware authentication
    const authResult = await validateWhopAuth();
    console.log("🔍 WhopAppPage: Auth result:", { success: authResult.success, error: authResult.error });

    if (!authResult.success || !authResult.user) {
      console.error("❌ WhopAppPage: Authentication failed:", authResult.error);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-300 mb-4">
              Please authenticate to access WatchTower Pro.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/20">
              <p className="text-sm text-red-300">
                Error: {authResult.error}
              </p>
            </div>
          </div>
        </div>
      );
    }

    const authenticatedUser = authResult.user;
    const userId = authenticatedUser.whopId;
    console.log("✅ WhopAppPage: User authenticated:", { userId, name: authenticatedUser.name });

    // For now, we'll show a welcome screen that will redirect to the dashboard
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
          <div className="text-center max-w-4xl">
            {/* Logo/Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                🗼 WatchTower Pro
              </h1>
              <p className="text-blue-300 text-lg">
                Advanced Website & Whop Metrics Monitoring
              </p>
            </div>

            {/* Welcome Message */}
            <div className="bg-slate-800/50 rounded-lg p-8 border border-blue-500/20 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Welcome back, <span className="text-blue-400">{authenticatedUser.name || 'User'}</span>!
              </h2>
              <p className="text-gray-300 mb-6">
                Your WatchTower Pro monitoring dashboard is ready. Track website uptime, performance, 
                and Whop metrics all in one place.
              </p>
              
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-700/50 rounded p-3">
                  <p className="text-gray-400">User ID</p>
                  <p className="text-white font-mono">{userId}</p>
                </div>
                <div className="bg-slate-700/50 rounded p-3">
                  <p className="text-gray-400">Plan</p>
                  <p className="text-blue-400 font-semibold">{authenticatedUser.plan}</p>
                </div>
                <div className="bg-slate-700/50 rounded p-3">
                  <p className="text-gray-400">Access Level</p>
                  <p className="text-green-400 font-semibold">{authenticatedUser.accessLevel}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/50 hover:border-blue-500/50 transition-colors">
                <div className="text-blue-400 text-2xl mb-2">📊</div>
                <h3 className="text-white font-semibold mb-1">Dashboard</h3>
                <p className="text-gray-400 text-sm">View all monitors</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/50 hover:border-green-500/50 transition-colors">
                <div className="text-green-400 text-2xl mb-2">➕</div>
                <h3 className="text-white font-semibold mb-1">Add Monitor</h3>
                <p className="text-gray-400 text-sm">Create new monitor</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/50 hover:border-yellow-500/50 transition-colors">
                <div className="text-yellow-400 text-2xl mb-2">🔔</div>
                <h3 className="text-white font-semibold mb-1">Alerts</h3>
                <p className="text-gray-400 text-sm">Manage alerts</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/50 hover:border-purple-500/50 transition-colors">
                <div className="text-purple-400 text-2xl mb-2">💰</div>
                <h3 className="text-white font-semibold mb-1">Billing</h3>
                <p className="text-gray-400 text-sm">Upgrade plan</p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ WhopAppPage: Detailed error:", error);
    console.error("❌ WhopAppPage: Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("❌ WhopAppPage: Error message:", error instanceof Error ? error.message : String(error));
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Error Loading App
          </h1>
          <p className="text-gray-300 mb-4">
            There was an error loading WatchTower Pro. Please try again later.
          </p>
          <details className="mt-4 text-left bg-slate-800/50 p-4 rounded border border-red-500/20">
            <summary className="cursor-pointer font-semibold text-red-300">Debug Info</summary>
            <pre className="mt-2 text-xs text-gray-400">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
} 