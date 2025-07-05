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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [monitoringStats, setMonitoringStats] = useState<any>(null);
  const [testingMonitor, setTestingMonitor] = useState<string | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<
    "stopped" | "running" | "starting"
  >("stopped");

  useEffect(() => {
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
      const [monitorsRes, alertsRes] = await Promise.all([
        fetch('/api/monitors'),
        fetch('/api/alerts'),
      ]);

      if (!monitorsRes.ok || !alertsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const monitorsData = await monitorsRes.json();
      const alertsData = await alertsRes.json();

      setMonitors(monitorsData);
      setAlerts(alertsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitoringStats = async () => {
    try {
      const response = await fetch('/api/monitoring?action=stats');
      if (response.ok) {
        const stats = await response.json();
        setMonitoringStats(stats);
        setMonitoringStatus("running");
      }
    } catch (err) {
      console.warn("Failed to fetch monitoring stats:", err);
      // Check if monitoring is stopped
      try {
        const statusResponse = await fetch('/api/monitoring?action=status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setMonitoringStatus(
            statusData.status === "running" ? "running" : "stopped",
          );
        }
      } catch (statusErr) {
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
        return "text-green-600 bg-green-100";
      case "PAUSED":
        return "text-yellow-600 bg-yellow-100";
      case "DISABLED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const calculateUptime = (monitor: Monitor) => {
    if (!monitor._count.checks) return "N/A";
    const incidents = monitor._count.incidents;
    const checks = monitor._count.checks;
    const uptime = ((checks - incidents) / checks) * 100;
    return `${uptime.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
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
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor your websites and get alerts when something goes wrong
        </p>
      </div>

      {/* Monitoring System Status */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Monitoring System Status
          </h3>
          <div className="flex items-center space-x-2">
            {monitoringStatus === "running" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Running
              </span>
            ) : monitoringStatus === "starting" ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></div>
                Starting...
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                Stopped
              </span>
            )}
            {monitoringStatus === "stopped" ? (
              <button
                onClick={startMonitoring}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Start Monitoring
              </button>
            ) : (
              <button
                onClick={() =>
                  (window.location.href = "/api/monitoring?action=health")
                }
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Health Check
              </button>
            )}
          </div>
        </div>
        {monitoringStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {monitoringStats.recentChecks?.count || 0}
              </div>
              <div className="text-sm text-gray-500">Checks (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(
                  monitoringStats.recentChecks?.averageResponseTime || 0,
                )}
                ms
              </div>
              <div className="text-sm text-gray-500">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {monitoringStats.engineStats?.totalMonitors || 0}
              </div>
              <div className="text-sm text-gray-500">Total Monitors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {monitoringStats.engineStats?.activeMonitors || 0}
              </div>
              <div className="text-sm text-gray-500">Active Monitors</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Start monitoring to see real-time statistics
            </p>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Monitors
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {monitors.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Monitors
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
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

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Alerts
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {alerts.filter((a: Alert) => a.status === "ACTIVE").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monitors List */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Monitors
            </h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Create Monitor
            </button>
          </div>

          {monitors.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
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
              <p className="text-gray-500">
                No monitors yet. Create your first monitor to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Check
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monitors.slice(0, 5).map((monitor: Monitor) => (
                    <tr key={monitor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {monitor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {monitor.url}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(monitor.status)}`}
                        >
                          {monitor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {monitor.responseTime
                          ? `${monitor.responseTime}ms`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateUptime(monitor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {monitor.lastCheck
                          ? new Date(monitor.lastCheck).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => testMonitor(monitor.id)}
                          disabled={testingMonitor === monitor.id}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                        >
                          {testingMonitor === monitor.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Testing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                />
                              </svg>
                              Test
                            </>
                          )}
                        </button>
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Monitors
                </span>
                <span className="text-sm text-gray-500">
                  {monitors.length} used
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Current Plan: {userPlan}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Alerts
                </span>
                <span className="text-sm text-gray-500">
                  {alerts.length} used
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Active:{" "}
                {alerts.filter((a: Alert) => a.status === "ACTIVE").length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
