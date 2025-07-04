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
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">WatchTower Pro</h1>
          <p className="text-muted-foreground">
            Monitor your websites and get instant alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-500 border-green-500">
            <Activity className="w-3 h-3 mr-1" />
            System Online
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Monitors
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">11</div>
            <p className="text-xs text-green-500">99.2% uptime</p>
            <Progress value={99.2} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">1</div>
            <p className="text-xs text-red-500">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234ms</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              12ms faster
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">api.example.com</p>
                <p className="text-xs text-muted-foreground">
                  Monitor is back online
                </p>
              </div>
              <span className="text-xs text-muted-foreground">2 mins ago</span>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">shop.example.com</p>
                <p className="text-xs text-muted-foreground">
                  Monitor went offline
                </p>
              </div>
              <span className="text-xs text-muted-foreground">5 mins ago</span>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">blog.example.com</p>
                <p className="text-xs text-muted-foreground">
                  Response time increased
                </p>
              </div>
              <span className="text-xs text-muted-foreground">12 mins ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/monitors/create">
              <Button className="w-full h-auto p-4 justify-start">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Add Monitor</div>
                    <div className="text-xs opacity-80">
                      Create a new website monitor
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>

            <Link href="/billing">
              <Button
                variant="outline"
                className="w-full h-auto p-4 justify-start"
              >
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Upgrade Plan</div>
                    <div className="text-xs text-muted-foreground">
                      Get more monitors and features
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>

            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">System Health:</span> All systems
                operational
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Your Monitors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Monitors</CardTitle>
            <Button variant="ghost" size="sm">
              View all monitors <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Monitor 1 */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Main Website</p>
                  <p className="text-sm text-muted-foreground">
                    https://example.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="font-medium">99.9%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">245ms</p>
                  <p className="text-xs text-muted-foreground">Response</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-500 border-green-500"
                >
                  online
                </Badge>
              </div>
            </div>

            {/* Monitor 2 */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">API Endpoint</p>
                  <p className="text-sm text-muted-foreground">
                    https://api.example.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="font-medium">98.5%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">156ms</p>
                  <p className="text-xs text-muted-foreground">Response</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-500 border-green-500"
                >
                  online
                </Badge>
              </div>
            </div>

            {/* Monitor 3 */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Shop Page</p>
                  <p className="text-sm text-muted-foreground">
                    https://shop.example.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="font-medium">95.2%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center">
                  <p className="font-medium">--</p>
                  <p className="text-xs text-muted-foreground">Response</p>
                </div>
                <Badge variant="destructive">offline</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
