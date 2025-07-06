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
    color: "blue",
  },
  { value: "PING", label: "Ping", description: "Monitor server availability", color: "green" },
  {
    value: "TCP",
    label: "TCP Port",
    description: "Monitor TCP port connectivity",
    color: "purple",
  },
  {
    value: "WHOP_METRICS",
    label: "Whop Metrics",
    description: "Monitor Whop business metrics",
    color: "cyan",
  },
  {
    value: "WHOP_SALES",
    label: "Whop Sales",
    description: "Monitor Whop sales performance",
    color: "orange",
  },
  {
    value: "WHOP_USERS",
    label: "Whop Users",
    description: "Monitor Whop user growth",
    color: "pink",
  },
  {
    value: "WHOP_REVENUE",
    label: "Whop Revenue",
    description: "Monitor Whop revenue metrics",
    color: "emerald",
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
    <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-800/90 backdrop-blur-sm border border-blue-400/30 rounded-xl shadow-2xl">
      <div className="px-6 py-4 border-b border-blue-400/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ⚡ Create New Monitor
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Set up monitoring for your websites and services
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 rounded-lg border border-transparent hover:border-red-400/30"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-400/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">Error</h3>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Monitor Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="My Website Monitor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Monitor Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {monitorTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange("type", type.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.type === type.value
                        ? `border-${type.color}-400 bg-gradient-to-r from-${type.color}-600/20 to-${type.color}-500/20 backdrop-blur-sm`
                        : "border-slate-600/50 bg-slate-700/30 hover:border-slate-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${
                          formData.type === type.value 
                            ? `text-${type.color}-300` 
                            : "text-white"
                        }`}>
                          {type.label}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {type.description}
                        </p>
                      </div>
                      {formData.type === type.value && (
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r from-${type.color}-500 to-${type.color}-400 shadow-lg`} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {!isWhopMonitor && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  URL to Monitor
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleChange("url", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="https://example.com"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Check Interval (seconds)
                </label>
                <select
                  value={formData.interval}
                  onChange={(e) => handleChange("interval", parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={600}>10 minutes</option>
                  <option value={1800}>30 minutes</option>
                  <option value={3600}>1 hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => handleChange("timeout", parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Retries
                </label>
                <input
                  type="number"
                  value={formData.retries}
                  onChange={(e) => handleChange("retries", parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t border-slate-600/50 pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
            >
              <div>
                <h3 className="text-lg font-medium text-white">
                  Advanced Options
                </h3>
                <p className="text-sm text-slate-400">
                  Configure additional monitoring parameters
                </p>
              </div>
              {showAdvanced ? (
                <ChevronDownIcon className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-6 space-y-6 bg-gradient-to-r from-slate-800/30 to-slate-700/30 p-6 rounded-xl border border-slate-600/30">
                {formData.type === "HTTP" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        HTTP Method
                      </label>
                      <select
                        value={formData.method}
                        onChange={(e) => handleChange("method", e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                      >
                        {httpMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Expected Status Code
                      </label>
                      <input
                        type="number"
                        value={formData.expectedStatus}
                        onChange={(e) => handleChange("expectedStatus", parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                        min="100"
                        max="599"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Expected Content
                      </label>
                      <textarea
                        value={formData.expectedContent}
                        onChange={(e) => handleChange("expectedContent", e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                        rows={3}
                        placeholder="Text that should be present in the response"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="sslCheck"
                        checked={formData.sslCheck}
                        onChange={(e) => handleChange("sslCheck", e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="sslCheck" className="text-sm text-white">
                        Enable SSL certificate monitoring
                      </label>
                    </div>

                    {formData.sslCheck && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          SSL Expiry Warning (days)
                        </label>
                        <input
                          type="number"
                          value={formData.sslExpiryDays}
                          onChange={(e) => handleChange("sslExpiryDays", parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                          min="1"
                          max="365"
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Response Time Threshold (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.responseTimeThreshold}
                    onChange={(e) => handleChange("responseTimeThreshold", parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    min="100"
                    max="30000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-600/50">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white hover:bg-slate-600/50 transition-all duration-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Monitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
