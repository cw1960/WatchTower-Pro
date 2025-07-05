"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "secondary" | "muted";
}

export function LoadingSpinner({
  size = "md",
  className,
  color = "primary",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colorClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    muted: "text-gray-400",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className,
      )}
    />
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  blur?: boolean;
}

export function LoadingOverlay({
  isLoading,
  children,
  loadingText = "Loading...",
  className,
  blur = true,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center",
            blur ? "backdrop-blur-sm" : "",
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600 font-medium">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary";
}

export function LoadingButton({
  isLoading,
  children,
  className,
  disabled,
  onClick,
  variant = "default",
}: LoadingButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {isLoading && <LoadingSpinner size="sm" color="secondary" />}
      {children}
    </button>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  animate?: boolean;
}

export function LoadingSkeleton({
  className,
  lines = 1,
  animate = true,
}: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-gray-200 rounded",
            animate && "animate-pulse",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingCard({
  title = "Loading...",
  description = "Please wait while we fetch your data.",
  className,
}: LoadingCardProps) {
  return (
    <div className={cn("bg-white rounded-lg border p-6 shadow-sm", className)}>
      <div className="flex items-center gap-3 mb-4">
        <LoadingSpinner size="md" />
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        <LoadingSkeleton lines={3} />
      </div>
    </div>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
  showProgress?: boolean;
  progress?: number;
}

export function LoadingPage({
  title = "Loading WatchTower Pro",
  description = "Setting up your monitoring dashboard...",
  showProgress = false,
  progress = 0,
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <LoadingSpinner size="xl" className="mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-600">{description}</p>
          </div>

          {showProgress && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            This may take a few moments...
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTable({
  rows = 5,
  columns = 4,
  className,
}: LoadingTableProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="bg-gray-50 border-b p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1">
              <LoadingSkeleton lines={1} />
            </div>
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, j) => (
                <div key={j} className="flex-1">
                  <LoadingSkeleton lines={1} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Status indicators for different states
interface StatusIndicatorProps {
  status: "loading" | "success" | "error" | "warning";
  message?: string;
  className?: string;
}

export function StatusIndicator({
  status,
  message,
  className,
}: StatusIndicatorProps) {
  const statusConfig = {
    loading: {
      icon: <LoadingSpinner size="sm" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    success: {
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    warning: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium",
        config.color,
        config.bgColor,
        className,
      )}
    >
      {config.icon}
      {message && <span>{message}</span>}
    </div>
  );
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
    setSuccess(false);
  };

  const setLoadingSuccess = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(true);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    isLoading,
    error,
    success,
    startLoading,
    stopLoading,
    setLoadingError,
    setLoadingSuccess,
    reset,
  };
}
