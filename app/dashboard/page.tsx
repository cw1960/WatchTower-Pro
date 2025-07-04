import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowUpRight,
  Activity,
  Globe,
  AlertTriangle,
  Clock,
  Plus,
  Settings,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-bold text-white">WatchTower Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className="text-green-400 border-green-400/20 bg-green-400/10"
              >
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Professional Plan
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white">Welcome back!</h2>
          <p className="text-slate-400">
            Here's what's happening with your monitors today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Monitors */}
          <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Monitors
              </CardTitle>
              <Globe className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12</div>
              <p className="text-xs text-green-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2 this month
              </p>
            </CardContent>
          </Card>

          {/* Online Status */}
          <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Online
              </CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">11</div>
              <p className="text-xs text-green-400">99.2% uptime</p>
              <Progress value={99.2} className="h-1 mt-2 bg-slate-800" />
            </CardContent>
          </Card>

          {/* Issues */}
          <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Issues
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">1</div>
              <p className="text-xs text-red-400">Needs attention</p>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Avg Response
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">234ms</div>
              <p className="text-xs text-blue-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                12ms faster
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-800/50">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    api.example.com
                  </p>
                  <p className="text-xs text-slate-400">
                    Monitor is back online
                  </p>
                </div>
                <span className="text-xs text-slate-500">2 mins ago</span>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-800/50">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    shop.example.com
                  </p>
                  <p className="text-xs text-slate-400">Monitor went offline</p>
                </div>
                <span className="text-xs text-slate-500">5 mins ago</span>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-800/50">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    blog.example.com
                  </p>
                  <p className="text-xs text-slate-400">
                    Response time increased
                  </p>
                </div>
                <span className="text-xs text-slate-500">12 mins ago</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/monitors/create">
                <Button className="w-full justify-between bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">Add Monitor</p>
                      <p className="text-xs text-blue-100">
                        Create a new website monitor
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/billing">
                <Button
                  variant="outline"
                  className="w-full justify-between border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">Upgrade Plan</p>
                      <p className="text-xs text-slate-400">
                        Get more monitors and features
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>

              <Alert className="bg-slate-800/50 border-slate-600">
                <Activity className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-slate-300">
                  <span className="font-medium">System Health:</span> All
                  systems operational
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Recent Monitors */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Your Monitors</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300"
              >
                View all monitors
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="font-medium text-white">Main Website</p>
                    <p className="text-sm text-slate-400">
                      https://example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-white">99.9%</p>
                    <p className="text-xs text-slate-400">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white">245ms</p>
                    <p className="text-xs text-slate-400">Response</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-400 border-green-400/20 bg-green-400/10"
                  >
                    online
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="font-medium text-white">API Endpoint</p>
                    <p className="text-sm text-slate-400">
                      https://api.example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-white">98.5%</p>
                    <p className="text-xs text-slate-400">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white">156ms</p>
                    <p className="text-xs text-slate-400">Response</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-400 border-green-400/20 bg-green-400/10"
                  >
                    online
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div>
                    <p className="font-medium text-white">Shop Page</p>
                    <p className="text-sm text-slate-400">
                      https://shop.example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-white">95.2%</p>
                    <p className="text-xs text-slate-400">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-white">--</p>
                    <p className="text-xs text-slate-400">Response</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-red-400 border-red-400/20 bg-red-400/10"
                  >
                    offline
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
