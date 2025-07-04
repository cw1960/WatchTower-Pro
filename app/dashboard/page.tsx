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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  W
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                WatchTower Pro
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Zap className="w-4 h-4 mr-2 text-green-500" />
                System Online
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground"
              >
                <Globe className="w-4 h-4 mr-2" />
                Global Status
              </Button>

              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-foreground">
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your monitors today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Monitors */}
          <Card className="bg-card border-border hover:bg-accent/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Monitors
              </CardTitle>
              <Globe className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-green-500 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2 this month
              </p>
            </CardContent>
          </Card>

          {/* Online Monitors */}
          <Card className="bg-card border-border hover:bg-accent/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Online
              </CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">11</div>
              <p className="text-xs text-green-500">99.2% uptime</p>
              <Progress value={99.2} className="h-1 mt-2" />
            </CardContent>
          </Card>

          {/* Issues */}
          <Card className="bg-card border-border hover:bg-accent/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Issues
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">1</div>
              <p className="text-xs text-destructive">Needs attention</p>
            </CardContent>
          </Card>

          {/* Average Response Time */}
          <Card className="bg-card border-border hover:bg-accent/20 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Response
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">234ms</div>
              <p className="text-xs text-primary flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                12ms faster
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">
                  Recent Activity
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-accent/20">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    api.example.com
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Monitor is back online
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  2 mins ago
                </span>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-accent/20">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    shop.example.com
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Monitor went offline
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  5 mins ago
                </span>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-lg bg-accent/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    blog.example.com
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Response time increased
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  12 mins ago
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/monitors/create">
                <Button className="w-full justify-between bg-primary hover:bg-primary/90 text-primary-foreground">
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">Add Monitor</p>
                      <p className="text-xs opacity-80">
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
                  className="w-full justify-between border-border text-foreground hover:bg-accent"
                >
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <p className="font-medium">Upgrade Plan</p>
                      <p className="text-xs text-muted-foreground">
                        Get more monitors and features
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>

              <Alert className="bg-accent/20 border-border">
                <Activity className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-muted-foreground">
                  <span className="font-medium">System Health:</span> All
                  systems operational
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Your Monitors */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Your Monitors</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                View all monitors
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">Main Website</p>
                    <p className="text-sm text-muted-foreground">
                      https://example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-foreground">99.9%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">245ms</p>
                    <p className="text-xs text-muted-foreground">Response</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-500 border-green-500/20 bg-green-500/10"
                  >
                    online
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">API Endpoint</p>
                    <p className="text-sm text-muted-foreground">
                      https://api.example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-foreground">98.5%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">156ms</p>
                    <p className="text-xs text-muted-foreground">Response</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-500 border-green-500/20 bg-green-500/10"
                  >
                    online
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">Shop Page</p>
                    <p className="text-sm text-muted-foreground">
                      https://shop.example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="font-medium text-foreground">95.2%</p>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">--</p>
                    <p className="text-xs text-muted-foreground">Response</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-destructive border-destructive/20 bg-destructive/10"
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
