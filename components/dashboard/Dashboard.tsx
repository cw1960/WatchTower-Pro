"use client";

import React, { useState, useEffect } from "react";
import { PlanType } from "@/lib/whop-sdk";

interface DashboardProps {
  userId: string;
  userPlan: PlanType;
}

interface Monitor {
  id: string;
  name: string;
  url: string;
  status: "ACTIVE" | "PAUSED" | "DISABLED";
  type: string;
  lastCheck?: Date;
  responseTime?: number;
  _count: {
    checks: number;
    incidents: number;
  };
}

interface Alert {
  id: string;
  name: string;
  type: string;
  status: "ACTIVE" | "PAUSED" | "DISABLED";
  _count: {
    incidents: number;
    notifications: number;
  };
}

export default function Dashboard({ userId, userPlan }: DashboardProps) {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [monitoringStats, setMonitoringStats] = useState<any>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<
    "running" | "stopped" | "starting"
  >("stopped");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingMonitor, setTestingMonitor] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial data
    fetchDashboardData();
    // Fetch monitoring stats
    fetchMonitoringStats();

    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchMonitoringStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Dashboard: Starting to fetch data...");
      
      // Fetch monitors
      console.log("🔍 Dashboard: Fetching monitors...");
      const monitorsRes = await fetch(`/api/monitors?userId=${userId}`);
      console.log("📊 Dashboard: Monitors response status:", monitorsRes.status);
      
      if (!monitorsRes.ok) {
        const errorText = await monitorsRes.text();
        console.error("❌ Dashboard: Monitors API failed:", errorText);
        throw new Error(`Failed to fetch monitors: ${monitorsRes.status} - ${errorText}`);
      }
      
      const monitorsData = await monitorsRes.json();
      console.log("✅ Dashboard: Monitors data received:", monitorsData.length, "monitors");
      
      // Fetch alerts
      console.log("🔍 Dashboard: Fetching alerts...");
      const alertsRes = await fetch(`/api/alerts?userId=${userId}`);
      console.log("📊 Dashboard: Alerts response status:", alertsRes.status);
      
      if (!alertsRes.ok) {
        const errorText = await alertsRes.text();
        console.error("❌ Dashboard: Alerts API failed:", errorText);
        throw new Error(`Failed to fetch alerts: ${alertsRes.status} - ${errorText}`);
      }
      
      const alertsData = await alertsRes.json();
      console.log("✅ Dashboard: Alerts data received:", alertsData.length, "alerts");

      setMonitors(monitorsData || []);
      setAlerts(alertsData || []);
      
      console.log("✅ Dashboard: All data fetched successfully");
    } catch (err) {
      console.error("❌ Dashboard: Error in fetchDashboardData:", err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitoringStats = async () => {
    try {
      console.log("🔍 Dashboard: Fetching monitoring stats...");
      const response = await fetch(`/api/monitoring?action=stats&userId=${userId}`);
      console.log("📊 Dashboard: Monitoring stats response status:", response.status);
      
      if (response.ok) {
        const stats = await response.json();
        console.log("✅ Dashboard: Monitoring stats received:", stats);
        setMonitoringStats(stats);
        setMonitoringStatus("running");
      } else {
        console.warn("⚠️ Dashboard: Monitoring stats failed, checking status...");
        throw new Error('Stats not available');
      }
    } catch (err) {
      console.warn("⚠️ Dashboard: Failed to fetch monitoring stats:", err);
      // Check if monitoring is stopped
      try {
        console.log("🔍 Dashboard: Checking monitoring status...");
        const statusResponse = await fetch(`/api/monitoring?action=status&userId=${userId}`);
        console.log("📊 Dashboard: Monitoring status response:", statusResponse.status);
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log("✅ Dashboard: Monitoring status data:", statusData);
          setMonitoringStatus(
            statusData.status === "running" ? "running" : "stopped",
          );
        }
      } catch (statusErr) {
        console.error("❌ Dashboard: Status check failed:", statusErr);
        setMonitoringStatus("stopped");
      }
    }
  };

  const startMonitoring = async () => {
    try {
      setMonitoringStatus("starting");
      const response = await fetch("/api/monitoring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMonitoringStatus("running");
        fetchMonitoringStats();
        fetchDashboardData();
        alert("Monitoring system started successfully!");
      } else {
        setMonitoringStatus("stopped");
        alert(`Failed to start monitoring: ${result.error}`);
      }
    } catch (err) {
      setMonitoringStatus("stopped");
      alert(
        `Failed to start monitoring: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const testMonitor = async (monitorId: string) => {
    try {
      setTestingMonitor(monitorId);
      const response = await fetch("/api/monitoring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "test",
          monitorId,
          userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the dashboard data to show updated results
        fetchDashboardData();
        fetchMonitoringStats();

        // Show success notification (you could use a toast library here)
        alert(
          `Monitor test completed!\nResponse Time: ${result.result.responseTime || "N/A"}ms\nStatus: ${result.result.success ? "Success" : "Failed"}`,
        );
      } else {
        alert(`Monitor test failed: ${result.error}`);
      }
    } catch (err) {
      alert(
        `Monitor test failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setTestingMonitor(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-300 bg-green-500/20 border border-green-500/30";
      case "PAUSED":
        return "text-yellow-300 bg-yellow-500/20 border border-yellow-500/30";
      case "DISABLED":
        return "text-gray-300 bg-gray-500/20 border border-gray-500/30";
      default:
        return "text-gray-300 bg-gray-500/20 border border-gray-500/30";
    }
  };

  const calculateUptime = (monitor: Monitor) => {
    if (!monitor._count.checks) return "N/A";
    const incidents = monitor._count.incidents;
    const checks = monitor._count.checks;
    const uptime = ((checks - incidents) / checks) * 100;
    return `${uptime.toFixed(1)}%`;
  };

  // Plan limits based on user plan
  const planLimits = {
    monitors: userPlan?.toUpperCase() === "PRO" ? 100 : userPlan?.toUpperCase() === "STARTER" ? 10 : 3,
    alerts: userPlan?.toUpperCase() === "PRO" ? 1000 : userPlan?.toUpperCase() === "STARTER" ? 100 : 10,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 m-4">
        <div className="flex">
          <div className="text-red-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-300">Error</h3>
            <p className="text-sm text-red-200 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          🗼 WatchTower Pro Dashboard
        </h1>
        <p className="mt-2 text-sm text-blue-300">
          Monitor your websites and get alerts when something goes wrong
        </p>
      </div>

      {/* Monitoring System Status */}
      <div className="bg-gradient-to-r from-slate-800/90 via-blue-900/50 to-slate-800/90 border border-blue-500/30 rounded-lg mb-6 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Monitoring System Status
          </h3>
          <div className="flex items-center space-x-2">
            {monitoringStatus === "running" ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Running
              </span>
            ) : monitoringStatus === "starting" ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                Starting...
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Stopped
              </span>
            )}
            {monitoringStatus === "stopped" ? (
              <button
                onClick={startMonitoring}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Start Monitoring
              </button>
            ) : (
              <button
                onClick={() =>
                  (window.location.href = "/api/monitoring?action=health")
                }
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Health Check
              </button>
            )}
          </div>
        </div>
        {monitoringStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30 shadow-lg">
              <div className="text-2xl font-bold text-white">
                {monitoringStats.recentChecks?.count || 0}
              </div>
              <div className="text-sm text-cyan-300">Checks (24h)</div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30 shadow-lg">
              <div className="text-2xl font-bold text-white">
                {Math.round(
                  monitoringStats.recentChecks?.averageResponseTime || 0,
                )}
                ms
              </div>
              <div className="text-sm text-pink-300">Avg Response</div>
            </div>
            <div className="text-center bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30 shadow-lg">
              <div className="text-2xl font-bold text-white">
                {monitoringStats.engineStats?.totalMonitors || 0}
              </div>
              <div className="text-sm text-emerald-300">Total Monitors</div>
            </div>
            <div className="text-center bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-4 border border-orange-400/30 shadow-lg">
              <div className="text-2xl font-bold text-white">
                {monitoringStats.engineStats?.activeMonitors || 0}
              </div>
              <div className="text-sm text-yellow-300">Active Monitors</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              Start monitoring to see real-time statistics
            </p>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-sm border border-blue-400/30 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-cyan-300 truncate">
                    Total Monitors
                  </dt>
                  <dd className="text-2xl font-bold text-white">
                    {monitors.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-sm border border-green-400/30 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-emerald-300 truncate">
                    Active Monitors
                  </dt>
                  <dd className="text-2xl font-bold text-white">
                    {
                      monitors.filter((m: Monitor) => m.status === "ACTIVE")
                        .length
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 backdrop-blur-sm border border-yellow-400/30 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-orange-300 truncate">
                    Active Alerts
                  </dt>
                  <dd className="text-2xl font-bold text-white">
                    {alerts.filter((a: Alert) => a.status === "ACTIVE").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monitors List */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-600/50 rounded-xl mb-8 shadow-xl">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Recent Monitors
            </h3>
            <a 
              href="/monitors/create"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Create Monitor
            </a>
          </div>

          {monitors.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                No monitors yet
              </h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Create your first monitor to start tracking website uptime and performance.
              </p>
              <a
                href="/monitors/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your First Monitor
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600/50">
                <thead className="bg-gradient-to-r from-slate-700/80 to-slate-800/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                      Last Check
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/40 divide-y divide-slate-600/30">
                  {monitors.slice(0, 5).map((monitor: Monitor, index: number) => (
                    <tr key={monitor.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {monitor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-300">
                          {monitor.url}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
                            monitor.status === "ACTIVE"
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              : monitor.status === "PAUSED"
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                              : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            monitor.status === "ACTIVE"
                              ? "bg-white animate-pulse"
                              : "bg-white"
                          }`}></span>
                          {monitor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {monitor.lastCheck ? (
                          <time
                            dateTime={new Date(monitor.lastCheck).toISOString()}
                            className="text-purple-300"
                          >
                            {new Date(monitor.lastCheck).toLocaleString()}
                          </time>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Plan Usage */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-400/30 rounded-xl shadow-xl">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Plan Usage
            </h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              {userPlan} Plan
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-300">
                  Monitors
                </span>
                <span className="text-sm text-white">
                  {monitors.length} / {planLimits.monitors}
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full shadow-lg"
                  style={{
                    width: `${Math.min((monitors.length / planLimits.monitors) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-300">
                  Alerts
                </span>
                <span className="text-sm text-white">
                  {alerts.length} / {planLimits.alerts}
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full shadow-lg"
                  style={{
                    width: `${Math.min((alerts.length / planLimits.alerts) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            {planLimits.monitors > 0 && monitors.length >= planLimits.monitors && (
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg p-4 mt-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-orange-300">
                      Monitor limit reached
                    </h4>
                    <p className="text-sm text-orange-200 mt-1">
                      You've reached your plan limit. Upgrade to add more monitors.
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <a
                      href="/billing"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Upgrade
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
