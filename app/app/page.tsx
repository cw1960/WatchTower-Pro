import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Shield,
  Bell,
  Settings,
  TrendingUp,
  Zap,
  Plus,
  CreditCard,
  Activity,
  Users,
  Globe,
  AlertTriangle,
} from "lucide-react";

export default async function WhopAppPage() {
  try {
    console.log("🔍 WhopAppPage: Starting authentication");

    // Use the development-mode aware authentication
    const authResult = await validateWhopAuth();
    console.log("🔍 WhopAppPage: Auth result:", {
      success: authResult.success,
      error: authResult.error,
    });

    if (!authResult.success || !authResult.user) {
      console.error("❌ WhopAppPage: Authentication failed:", authResult.error);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center px-8">
          <Card className="max-w-md w-full bg-slate-900/80 border-red-500/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <CardTitle className="text-red-400">
                Authentication Required
              </CardTitle>
              <CardDescription className="text-slate-300">
                Please authenticate to access WatchTower Pro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/20">
                <p className="text-sm text-red-300">
                  Error: {authResult.error}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const authenticatedUser = authResult.user;
    const userId = authenticatedUser.whopId;
    console.log("✅ WhopAppPage: User authenticated:", {
      userId,
      name: authenticatedUser.name,
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                WatchTower Pro
              </h1>
            </div>
            <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
              Advanced Website & Whop Metrics Monitoring Platform
            </p>
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              Professional Monitoring Solution
            </Badge>
          </div>

          {/* Welcome Card */}
          <Card className="mb-8 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">
                    Welcome back,{" "}
                    <span className="text-blue-400">
                      {authenticatedUser.name || "User"}
                    </span>
                    !
                  </CardTitle>
                  <CardDescription className="text-slate-300 mt-2">
                    Your monitoring dashboard is ready. Track website uptime,
                    performance, and Whop metrics all in one place.
                  </CardDescription>
                </div>
                <div className="hidden md:block">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">User ID</p>
                      <p className="text-white font-mono text-sm">{userId}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm text-slate-400">Plan</p>
                      <p className="text-green-400 font-semibold">
                        {authenticatedUser.plan}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-slate-400">Access Level</p>
                      <p className="text-purple-400 font-semibold">
                        {authenticatedUser.accessLevel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Dashboard Card */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/80 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">
                      Dashboard
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Real-time monitoring overview
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  View comprehensive analytics and system status at a glance
                  with real-time data.
                </p>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  View Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Add Monitor Card */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/80 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">
                      Add Monitor
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Create new website monitors
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Set up monitoring for your websites with custom intervals and
                  advanced settings.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-green-500/30 text-green-400 hover:bg-green-500/20"
                >
                  Create Monitor
                </Button>
              </CardContent>
            </Card>

            {/* Alerts Card */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/80 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">Alerts</CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage notifications & alerts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Configure alert preferences and notification settings for
                  optimal monitoring.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                >
                  Manage Alerts
                </Button>
              </CardContent>
            </Card>

            {/* Whop Integration Card */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/80 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">
                      Whop Integration
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Business metrics tracking
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Monitor Whop-specific metrics and business data with advanced
                  analytics.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                >
                  View Metrics
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/80 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">
                      Analytics
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Performance insights & reports
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Detailed analytics and historical performance data with trend
                  analysis.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/80 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">
                      Settings
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Account configuration & preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Configure account preferences, system settings, and
                  integration options.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
                >
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status Footer */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-green-500/20 text-green-400 px-6 py-3 rounded-full border border-green-500/30 backdrop-blur-sm">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="font-medium">All Systems Operational</span>
              <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ WhopAppPage: Detailed error:", error);
    console.error(
      "❌ WhopAppPage: Error stack:",
      error instanceof Error ? error.stack : "No stack",
    );
    console.error(
      "❌ WhopAppPage: Error message:",
      error instanceof Error ? error.message : String(error),
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 flex items-center justify-center px-8">
        <Card className="max-w-lg w-full bg-slate-900/80 border-red-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <CardTitle className="text-red-400">Error Loading App</CardTitle>
            <CardDescription className="text-slate-300">
              There was an error loading WatchTower Pro. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <details className="bg-slate-800/50 p-4 rounded-lg border border-red-500/20">
              <summary className="cursor-pointer font-semibold text-red-300 mb-2">
                Debug Information
              </summary>
              <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                {error instanceof Error ? error.message : String(error)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    );
  }
}
