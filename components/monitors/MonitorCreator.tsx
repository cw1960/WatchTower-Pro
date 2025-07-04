"use client";

import { useState } from "react";
import { PlanType } from "@/lib/whop-sdk";

interface MonitorCreatorProps {
  userId: string;
  userPlan: PlanType;
  onMonitorCreated?: (monitor: any) => void;
  onCancel?: () => void;
}

const monitorTypes = [
  { value: "HTTP", label: "HTTP/HTTPS", description: "Monitor HTTP/HTTPS endpoints" },
  { value: "PING", label: "Ping", description: "Monitor server availability" },
  { value: "TCP", label: "TCP Port", description: "Monitor TCP port connectivity" },
  { value: "WHOP_METRICS", label: "Whop Metrics", description: "Monitor Whop business metrics" },
  { value: "WHOP_SALES", label: "Whop Sales", description: "Monitor Whop sales performance" },
  { value: "WHOP_USERS", label: "Whop Users", description: "Monitor Whop user growth" },
  { value: "WHOP_REVENUE", label: "Whop Revenue", description: "Monitor Whop revenue metrics" },
];

const httpMethods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"];

export default function MonitorCreator({ userId, userPlan, onMonitorCreated, onCancel }: MonitorCreatorProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    type: "HTTP",
    interval: 300,
    timeout: 30,
    retries: 3,
    method: "GET",
    headers: {} as Record<string, string>,
    body: "",
    expectedStatus: 200,
    expectedContent: "",
    expectedKeywords: [] as string[],
    sslCheck: false,
    sslExpiryDays: 30,
    responseTimeThreshold: 5000,
    whopMetrics: {} as Record<string, any>,
    whopThresholds: {} as Record<string, any>,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHeaderChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      headers: {
        ...prev.headers,
        [key]: value,
      },
    }));
  };

  const removeHeader = (key: string) => {
    setFormData(prev => ({
      ...prev,
      headers: Object.fromEntries(
        Object.entries(prev.headers).filter(([k]) => k !== key)
      ),
    }));
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.expectedKeywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        expectedKeywords: [...prev.expectedKeywords, keyword.trim()],
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      expectedKeywords: prev.expectedKeywords.filter(k => k !== keyword),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/monitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create monitor");
      }

      const monitor = await response.json();
      onMonitorCreated?.(monitor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isWhopMonitor = formData.type.startsWith("WHOP_");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Create New Monitor</h3>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Monitor Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Website Monitor"
                />
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <input
                  type="url"
                  id="url"
                  required
                  value={formData.url}
                  onChange={(e) => handleChange("url", e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Monitor Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Monitor Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {monitorTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Timing Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                  Check Interval (seconds)
                </label>
                <input
                  type="number"
                  id="interval"
                  min="60"
                  max="86400"
                  value={formData.interval}
                  onChange={(e) => handleChange("interval", parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="timeout" className="block text-sm font-medium text-gray-700">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  id="timeout"
                  min="5"
                  max="120"
                  value={formData.timeout}
                  onChange={(e) => handleChange("timeout", parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="retries" className="block text-sm font-medium text-gray-700">
                  Retries
                </label>
                <input
                  type="number"
                  id="retries"
                  min="1"
                  max="10"
                  value={formData.retries}
                  onChange={(e) => handleChange("retries", parseInt(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* HTTP Specific Settings */}
            {(formData.type === "HTTP" || formData.type === "HTTPS") && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="method" className="block text-sm font-medium text-gray-700">
                    HTTP Method
                  </label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => handleChange("method", e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {httpMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="expectedStatus" className="block text-sm font-medium text-gray-700">
                    Expected Status Code
                  </label>
                  <input
                    type="number"
                    id="expectedStatus"
                    min="100"
                    max="599"
                    value={formData.expectedStatus}
                    onChange={(e) => handleChange("expectedStatus", parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Settings
                <svg
                  className={`ml-1 h-4 w-4 transform ${showAdvanced ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="expectedContent" className="block text-sm font-medium text-gray-700">
                      Expected Content
                    </label>
                    <textarea
                      id="expectedContent"
                      value={formData.expectedContent}
                      onChange={(e) => handleChange("expectedContent", e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Content that should be present in the response"
                    />
                  </div>

                  <div>
                    <label htmlFor="responseTimeThreshold" className="block text-sm font-medium text-gray-700">
                      Response Time Threshold (ms)
                    </label>
                    <input
                      type="number"
                      id="responseTimeThreshold"
                      min="100"
                      max="30000"
                      value={formData.responseTimeThreshold}
                      onChange={(e) => handleChange("responseTimeThreshold", parseInt(e.target.value))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sslCheck"
                      checked={formData.sslCheck}
                      onChange={(e) => handleChange("sslCheck", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sslCheck" className="ml-2 block text-sm text-gray-900">
                      Enable SSL Certificate Monitoring
                    </label>
                  </div>

                  {formData.sslCheck && (
                    <div>
                      <label htmlFor="sslExpiryDays" className="block text-sm font-medium text-gray-700">
                        SSL Expiry Warning (days)
                      </label>
                      <input
                        type="number"
                        id="sslExpiryDays"
                        min="1"
                        max="365"
                        value={formData.sslExpiryDays}
                        onChange={(e) => handleChange("sslExpiryDays", parseInt(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Whop-specific settings */}
            {isWhopMonitor && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Whop Integration</h4>
                <p className="text-sm text-blue-700">
                  This monitor will track Whop-specific metrics. Additional configuration options will be available after creation.
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Monitor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 