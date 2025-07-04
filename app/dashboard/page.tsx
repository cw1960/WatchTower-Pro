import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <header
        className="border-b shadow-sm"
        style={{
          backgroundColor: "white",
          borderColor: "#e2e8f0",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#3b82f6" }}
              >
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: "#1f2937" }}>
                WatchTower Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center space-x-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <span style={{ color: "#16a34a" }}>●</span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "#16a34a" }}
                >
                  System Online
                </span>
              </div>
              <div
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: "#3b82f6", color: "white" }}
              >
                ✨ Professional Plan
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
            Welcome back!
          </h2>
          <p style={{ color: "#6b7280" }}>
            Here's what's happening with your monitors today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Monitors */}
          <div
            className="rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-200"
            style={{
              backgroundColor: "white",
              borderColor: "#e5e7eb",
            }}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
                Total Monitors
              </p>
              <p className="text-3xl font-bold" style={{ color: "#111827" }}>
                12
              </p>
              <p className="text-sm font-medium" style={{ color: "#16a34a" }}>
                ↗ +2 this month
              </p>
            </div>
          </div>

          {/* Online Status */}
          <div
            className="rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-200"
            style={{
              backgroundColor: "white",
              borderColor: "#e5e7eb",
            }}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
                Online
              </p>
              <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>
                11
              </p>
              <p className="text-sm font-medium" style={{ color: "#16a34a" }}>
                ● 99.2% uptime
              </p>
            </div>
          </div>

          {/* Issues */}
          <div
            className="rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-200"
            style={{
              backgroundColor: "white",
              borderColor: "#e5e7eb",
            }}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
                Issues
              </p>
              <p className="text-3xl font-bold" style={{ color: "#dc2626" }}>
                1
              </p>
              <p className="text-sm font-medium" style={{ color: "#dc2626" }}>
                ⚠ Needs attention
              </p>
            </div>
          </div>

          {/* Response Time */}
          <div
            className="rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-200"
            style={{
              backgroundColor: "white",
              borderColor: "#e5e7eb",
            }}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
                Avg Response
              </p>
              <p className="text-3xl font-bold" style={{ color: "#111827" }}>
                234ms
              </p>
              <p className="text-sm font-medium" style={{ color: "#2563eb" }}>
                ⚡ 12ms faster
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <div
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: "white",
              borderColor: "#e5e7eb",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-semibold"
                style={{ color: "#111827" }}
              >
                Recent Activity
              </h3>
              <Link
                href="/monitors"
                className="text-sm font-medium hover:underline"
                style={{ color: "#3b82f6" }}
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "#f9fafb" }}
              >
                <div className="flex items-center space-x-3">
                  <span style={{ color: "#16a34a" }}>●</span>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#111827" }}
                    >
                      api.example.com
                    </p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      Monitor is back online
                    </p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: "#6b7280" }}>
                  2 mins ago
                </span>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "#f9fafb" }}
              >
                <div className="flex items-center space-x-3">
                  <span style={{ color: "#dc2626" }}>●</span>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#111827" }}
                    >
                      shop.example.com
                    </p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      Monitor went offline
                    </p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: "#6b7280" }}>
                  5 mins ago
                </span>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: "#f9fafb" }}
              >
                <div className="flex items-center space-x-3">
                  <span style={{ color: "#f59e0b" }}>●</span>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#111827" }}
                    >
                      blog.example.com
                    </p>
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      Response time increased
                    </p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: "#6b7280" }}>
                  12 mins ago
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: "white",
              borderColor: "#e5e7eb",
            }}
          >
            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: "#111827" }}
            >
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/monitors/create"
                className="w-full flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all duration-200 group"
                style={{
                  backgroundColor: "#eff6ff",
                  borderColor: "#bfdbfe",
                }}
              >
                <div>
                  <p className="font-medium" style={{ color: "#111827" }}>
                    Add Monitor
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    Create a new website monitor
                  </p>
                </div>
                <span
                  className="group-hover:translate-x-1 transition-transform"
                  style={{ color: "#6b7280" }}
                >
                  →
                </span>
              </Link>

              <Link
                href="/billing"
                className="w-full flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-all duration-200 group"
                style={{ backgroundColor: "#f9fafb" }}
              >
                <div>
                  <p className="font-medium" style={{ color: "#111827" }}>
                    Upgrade Plan
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    Get more monitors and features
                  </p>
                </div>
                <span
                  className="group-hover:translate-x-1 transition-transform"
                  style={{ color: "#6b7280" }}
                >
                  →
                </span>
              </Link>

              <div
                className="w-full flex items-center justify-between p-4 rounded-lg"
                style={{ backgroundColor: "#f9fafb" }}
              >
                <div>
                  <p className="font-medium" style={{ color: "#111827" }}>
                    System Health
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    All systems operational
                  </p>
                </div>
                <span style={{ color: "#16a34a" }}>●</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Monitors */}
        <div
          className="rounded-xl p-6 shadow-sm border"
          style={{
            backgroundColor: "white",
            borderColor: "#e5e7eb",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: "#111827" }}>
              Your Monitors
            </h3>
            <Link
              href="/monitors"
              className="text-sm font-medium hover:underline"
              style={{ color: "#3b82f6" }}
            >
              View all monitors
            </Link>
          </div>
          <div className="space-y-4">
            <div
              className="flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-all duration-200"
              style={{ backgroundColor: "#f9fafb" }}
            >
              <div className="flex items-center space-x-4">
                <span style={{ color: "#16a34a" }}>●</span>
                <div>
                  <p className="font-medium" style={{ color: "#111827" }}>
                    Main Website
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    https://example.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-medium" style={{ color: "#111827" }}>
                    99.9%
                  </p>
                  <p style={{ color: "#6b7280" }}>Uptime</p>
                </div>
                <div className="text-center">
                  <p className="font-medium" style={{ color: "#111827" }}>
                    245ms
                  </p>
                  <p style={{ color: "#6b7280" }}>Response</p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                  }}
                >
                  online
                </div>
              </div>
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-all duration-200"
              style={{ backgroundColor: "#f9fafb" }}
            >
              <div className="flex items-center space-x-4">
                <span style={{ color: "#16a34a" }}>●</span>
                <div>
                  <p className="font-medium" style={{ color: "#111827" }}>
                    API Endpoint
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    https://api.example.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-medium" style={{ color: "#111827" }}>
                    98.5%
                  </p>
                  <p style={{ color: "#6b7280" }}>Uptime</p>
                </div>
                <div className="text-center">
                  <p className="font-medium" style={{ color: "#111827" }}>
                    156ms
                  </p>
                  <p style={{ color: "#6b7280" }}>Response</p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                  }}
                >
                  online
                </div>
              </div>
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-all duration-200"
              style={{ backgroundColor: "#f9fafb" }}
            >
              <div className="flex items-center space-x-4">
                <span style={{ color: "#dc2626" }}>●</span>
                <div>
                  <p className="font-medium" style={{ color: "#111827" }}>
                    Shop Page
                  </p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>
                    https://shop.example.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <p className="font-medium" style={{ color: "#111827" }}>
                    95.2%
                  </p>
                  <p style={{ color: "#6b7280" }}>Uptime</p>
                </div>
                <div className="text-center">
                  <p className="font-medium" style={{ color: "#111827" }}>
                    N/A
                  </p>
                  <p style={{ color: "#6b7280" }}>Response</p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                  }}
                >
                  offline
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
