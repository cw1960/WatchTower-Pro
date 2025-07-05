"use client";

import React, { useState } from "react";
import { PlanType } from "@prisma/client";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface MonitorCreatorProps {
  userId: string;
  userPlan: PlanType;
  onMonitorCreated?: (monitor: any) => void;
  onCancel?: () => void;
}

const monitorTypes = [
  {
    value: "HTTP",
    label: "HTTP/HTTPS",
    description: "Monitor HTTP/HTTPS endpoints",
  },
  { value: "PING", label: "Ping", description: "Monitor server availability" },
  {
    value: "TCP",
    label: "TCP Port",
    description: "Monitor TCP port connectivity",
  },
  {
    value: "WHOP_METRICS",
    label: "Whop Metrics",
    description: "Monitor Whop business metrics",
  },
  {
    value: "WHOP_SALES",
    label: "Whop Sales",
    description: "Monitor Whop sales performance",
  },
  {
    value: "WHOP_USERS",
    label: "Whop Users",
    description: "Monitor Whop user growth",
  },
  {
    value: "WHOP_REVENUE",
    label: "Whop Revenue",
    description: "Monitor Whop revenue metrics",
  },
];

const httpMethods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"];

export default function MonitorCreator({
  userId,
  userPlan,
  onMonitorCreated,
  onCancel,
}: MonitorCreatorProps) {
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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHeaderChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      headers: {
        ...prev.headers,
        [key]: value,
      },
    }));
  };

  const removeHeader = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      headers: Object.fromEntries(
        Object.entries(prev.headers).filter(([k]) => k !== key),
      ),
    }));
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.expectedKeywords.includes(keyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        expectedKeywords: [...prev.expectedKeywords, keyword.trim()],
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      expectedKeywords: prev.expectedKeywords.filter((k) => k !== keyword),
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Monitor
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set up monitoring for your websites and services
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Monitor Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="My Website Monitor"
                  />
                </div>

                <div>
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    required
                    value={formData.url}
                    onChange={(e) => handleChange("url", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Monitor Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Monitor Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {monitorTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing Configuration */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Timing Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="interval"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Check Interval (seconds)
                </label>
                <input
                  type="number"
                  id="interval"
                  min="60"
                  max="86400"
                  value={formData.interval}
                  onChange={(e) =>
                    handleChange("interval", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How often to check (60-86400 seconds)
                </p>
              </div>

              <div>
                <label
                  htmlFor="timeout"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  id="timeout"
                  min="5"
                  max="120"
                  value={formData.timeout}
                  onChange={(e) =>
                    handleChange("timeout", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Request timeout (5-120 seconds)
                </p>
              </div>

              <div>
                <label
                  htmlFor="retries"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Retries
                </label>
                <input
                  type="number"
                  id="retries"
                  min="1"
                  max="10"
                  value={formData.retries}
                  onChange={(e) =>
                    handleChange("retries", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of retries on failure
                </p>
              </div>
            </div>
          </div>

          {/* HTTP Specific Settings */}
          {(formData.type === "HTTP" || formData.type === "HTTPS") && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                HTTP Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="method"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    HTTP Method
                  </label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => handleChange("method", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {httpMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="expectedStatus"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Expected Status Code
                  </label>
                  <input
                    type="number"
                    id="expectedStatus"
                    min="100"
                    max="599"
                    value={formData.expectedStatus}
                    onChange={(e) =>
                      handleChange("expectedStatus", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {showAdvanced ? (
                <ChevronDownIcon className="w-5 h-5 mr-2" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 mr-2" />
              )}
              Advanced Settings
            </button>

            {showAdvanced && (
              <div className="mt-6 space-y-6">
                <div>
                  <label
                    htmlFor="expectedContent"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Expected Content
                  </label>
                  <textarea
                    id="expectedContent"
                    value={formData.expectedContent}
                    onChange={(e) =>
                      handleChange("expectedContent", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Content that should be present in the response"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Text that must be present in the response
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="responseTimeThreshold"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Response Time Threshold (ms)
                  </label>
                  <input
                    type="number"
                    id="responseTimeThreshold"
                    min="100"
                    max="30000"
                    value={formData.responseTimeThreshold}
                    onChange={(e) =>
                      handleChange(
                        "responseTimeThreshold",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert if response time exceeds this threshold
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="sslCheck"
                      checked={formData.sslCheck}
                      onChange={(e) =>
                        handleChange("sslCheck", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="sslCheck"
                      className="text-sm font-medium text-gray-700"
                    >
                      Enable SSL Certificate Monitoring
                    </label>
                    <p className="text-xs text-gray-500">
                      Monitor SSL certificate expiration
                    </p>
                  </div>
                </div>

                {formData.sslCheck && (
                  <div className="ml-7">
                    <label
                      htmlFor="sslExpiryDays"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      SSL Expiry Warning (days)
                    </label>
                    <input
                      type="number"
                      id="sslExpiryDays"
                      min="1"
                      max="365"
                      value={formData.sslExpiryDays}
                      onChange={(e) =>
                        handleChange("sslExpiryDays", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Alert when SSL expires within this many days
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Whop-specific settings */}
          {isWhopMonitor && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Whop Integration
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This monitor will track Whop-specific metrics. Additional
                    configuration options will be available after creation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Monitor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
