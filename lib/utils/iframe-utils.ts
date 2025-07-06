/**
 * Iframe utility functions for enhanced Whop platform communication
 * These utilities provide common patterns for iframe-to-parent communication
 */

import { useWhopUser } from "@/lib/context/WhopUserContext";

// Common message types for Whop platform communication
export enum WhopMessageType {
  READY = "app:ready",
  HEIGHT_CHANGE = "app:height-change",
  NAVIGATION = "app:navigation",
  USER_ACTION = "app:user-action",
  ERROR = "app:error",
  METRICS_UPDATE = "app:metrics-update",
  NOTIFICATION = "app:notification",
}

// Message payload interfaces
export interface WhopMessage {
  type: WhopMessageType;
  payload: any;
  timestamp: number;
}

export interface NavigationMessage {
  route: string;
  params?: Record<string, any>;
}

export interface MetricsMessage {
  monitors: number;
  alerts: number;
  uptime: number;
}

export interface NotificationMessage {
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

// Hook for iframe communication utilities
export function useWhopIframeUtils() {
  const { iframeActions, iframeSDK } = useWhopUser();

  // Notify parent that app is ready
  const notifyAppReady = async () => {
    try {
      if (iframeActions.isReady) {
        await iframeActions.notifyReady();
        await sendMessage(WhopMessageType.READY, {
          version: "1.0.0",
          features: ["monitoring", "alerts", "whop-metrics"],
        });
      }
    } catch (error) {
      console.error("Failed to notify app ready:", error);
    }
  };

  // Send a structured message to parent
  const sendMessage = async (type: WhopMessageType, payload: any) => {
    if (!iframeActions.isReady) {
      throw new Error("Iframe SDK not ready");
    }

    const message: WhopMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    return await iframeActions.sendMessage(message);
  };

  // Auto-resize iframe based on content
  const autoResizeHeight = () => {
    if (typeof window === "undefined" || !iframeActions.isReady) {
      return;
    }

    const updateHeight = async () => {
      try {
        // Get the full height of the document
        const height = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight,
        );

        await iframeActions.updateHeight(height);
        await sendMessage(WhopMessageType.HEIGHT_CHANGE, { height });
      } catch (error) {
        console.error("Failed to update height:", error);
      }
    };

    // Initial height update
    updateHeight();

    // Set up observers for dynamic content
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    const mutationObserver = new MutationObserver(() => {
      // Debounce the height updates
      setTimeout(updateHeight, 100);
    });

    // Observe changes
    resizeObserver.observe(document.body);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Return cleanup function
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  };

  // Navigate within the iframe or request parent navigation
  const navigate = async (route: string, params?: Record<string, any>) => {
    const payload: NavigationMessage = { route, params };
    await sendMessage(WhopMessageType.NAVIGATION, payload);
  };

  // Send user action analytics
  const trackUserAction = async (
    action: string,
    metadata?: Record<string, any>,
  ) => {
    await sendMessage(WhopMessageType.USER_ACTION, {
      action,
      metadata,
      userId: iframeSDK.sdk?.userId,
    });
  };

  // Send metrics updates to parent
  const updateMetrics = async (metrics: MetricsMessage) => {
    await sendMessage(WhopMessageType.METRICS_UPDATE, metrics);
  };

  // Send notification to parent
  const sendNotification = async (notification: NotificationMessage) => {
    await sendMessage(WhopMessageType.NOTIFICATION, notification);
  };

  // Handle errors and send to parent
  const reportError = async (error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    await sendMessage(WhopMessageType.ERROR, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: Date.now(),
    });
  };

  // Request data from parent Whop application
  const requestWhopData = async (dataType: string) => {
    if (!iframeActions.isReady) {
      throw new Error("Iframe SDK not ready");
    }

    return await iframeActions.requestData(dataType);
  };

  return {
    // Core communication
    sendMessage,
    requestWhopData,

    // App lifecycle
    notifyAppReady,

    // UI utilities
    autoResizeHeight,
    navigate,

    // Analytics and tracking
    trackUserAction,
    updateMetrics,

    // Notifications and errors
    sendNotification,
    reportError,

    // Status
    isReady: iframeActions.isReady,
    error: iframeActions.error || iframeSDK.error,
  };
}

// Hook for monitoring-specific iframe utilities
export function useMonitoringIframeUtils() {
  const iframeUtils = useWhopIframeUtils();

  const reportMonitorStatus = async (
    monitorId: string,
    status: "up" | "down",
    responseTime?: number,
  ) => {
    await iframeUtils.trackUserAction("monitor:status-change", {
      monitorId,
      status,
      responseTime,
    });
  };

  const reportAlertTriggered = async (
    alertId: string,
    monitorId: string,
    message: string,
  ) => {
    await iframeUtils.sendNotification({
      title: "Alert Triggered",
      message,
      type: "warning",
    });

    await iframeUtils.trackUserAction("alert:triggered", {
      alertId,
      monitorId,
      message,
    });
  };

  const updateDashboardMetrics = async (
    monitors: number,
    alerts: number,
    uptime: number,
  ) => {
    await iframeUtils.updateMetrics({ monitors, alerts, uptime });
  };

  return {
    ...iframeUtils,
    reportMonitorStatus,
    reportAlertTriggered,
    updateDashboardMetrics,
  };
}

// Utility for setting up automatic iframe behaviors
export function setupIframeAutoFeatures() {
  const utils = useWhopIframeUtils();

  // Set up error handling
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      utils.reportError(event.error || event.message, "global-error-handler");
    });

    window.addEventListener("unhandledrejection", (event) => {
      utils.reportError(event.reason, "unhandled-promise-rejection");
    });
  }

  return utils;
}
