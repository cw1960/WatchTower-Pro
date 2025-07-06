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
    borderClass: "from-blue-600 via-blue-500 to-cyan-600",
    textClass: "text-blue-300",
    iconClass: "from-blue-500 to-cyan-500",
  },
  { 
    value: "PING", 
    label: "Ping", 
    description: "Monitor server availability",
    borderClass: "from-green-600 via-green-500 to-emerald-600",
    textClass: "text-green-300",
    iconClass: "from-green-500 to-emerald-500",
  },
  {
    value: "TCP",
    label: "TCP Port",
    description: "Monitor TCP port connectivity",
    borderClass: "from-purple-600 via-purple-500 to-pink-600",
    textClass: "text-purple-300",
    iconClass: "from-purple-500 to-pink-500",
  },
  {
    value: "WHOP_METRICS",
    label: "Whop Metrics",
    description: "Monitor Whop business metrics",
    borderClass: "from-cyan-600 via-cyan-500 to-blue-600",
    textClass: "text-cyan-300",
    iconClass: "from-cyan-500 to-blue-500",
  },
  {
    value: "WHOP_SALES",
    label: "Whop Sales",
    description: "Monitor Whop sales performance",
    borderClass: "from-orange-600 via-orange-500 to-yellow-600",
    textClass: "text-orange-300",
    iconClass: "from-orange-500 to-yellow-500",
  },
  {
    value: "WHOP_USERS",
    label: "Whop Users",
    description: "Monitor Whop user growth",
    borderClass: "from-pink-600 via-pink-500 to-red-600",
    textClass: "text-pink-300",
    iconClass: "from-pink-500 to-red-500",
  },
  {
    value: "WHOP_REVENUE",
    label: "Whop Revenue",
    description: "Monitor Whop revenue metrics",
    borderClass: "from-emerald-600 via-emerald-500 to-green-600",
    textClass: "text-emerald-300",
    iconClass: "from-emerald-500 to-green-500",
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
    <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 border border-blue-500 rounded-xl shadow-2xl">
      <div className="px-6 py-4 border-b border-blue-500">
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
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-600 to-pink-600 p-[1px] rounded-lg">
            <div className="bg-slate-900 rounded-lg p-4">
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
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  <div 
                    key={type.value}
                    className={`bg-gradient-to-br ${type.borderClass} p-[2px] rounded-xl transition-all duration-300 ${
                      formData.type === type.value ? 'scale-105 shadow-xl' : 'hover:scale-102'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleChange("type", type.value)}
                      className="w-full p-4 bg-slate-900 rounded-xl text-left transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${
                            formData.type === type.value 
                              ? type.textClass 
                              : "text-white"
                          }`}>
                            {type.label}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            {type.description}
                          </p>
                        </div>
                        {formData.type === type.value && (
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${type.iconClass} shadow-lg`} />
                        )}
                      </div>
                    </button>
                  </div>
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
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  min="0"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t border-slate-600 pt-6">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-[1px] rounded-xl">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-left p-4 bg-slate-900 rounded-xl hover:bg-slate-800 transition-all duration-200"
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
            </div>

            {showAdvanced && (
              <div className="mt-6 space-y-6 bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-xl border border-slate-600">
                {formData.type === "HTTP" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        HTTP Method
                      </label>
                      <select
                        value={formData.method}
                        onChange={(e) => handleChange("method", e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    min="100"
                    max="30000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-600">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white hover:bg-slate-600 transition-all duration-200"
              >
                Cancel
              </button>
            )}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-[1px] rounded-xl">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-slate-900 hover:bg-transparent text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Monitor"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
