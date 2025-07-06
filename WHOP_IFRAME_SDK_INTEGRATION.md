# Whop Iframe SDK Integration Guide

WatchTower Pro now includes enhanced iframe communication capabilities using the `@whop-apps/iframe` package, providing seamless integration with the Whop platform through advanced postMessage communication.

## Overview

The `@whop-apps/iframe` package enables:

- **Enhanced Communication**: Direct messaging between your app and the Whop platform
- **Auto-resizing**: Automatic iframe height adjustment based on content
- **Error Reporting**: Automatic error reporting to the parent Whop application
- **Analytics Integration**: User action tracking and metrics reporting
- **Navigation Support**: Coordinated navigation between iframe and parent

## Installation

The package is already installed in your project:

```bash
npm install @whop-apps/iframe
```

## Core Features

### 1. Enhanced User Context

The `WhopUserContext` now includes iframe SDK capabilities:

```typescript
import { useWhopUser } from "@/lib/context/WhopUserContext";

function MyComponent() {
  const {
    user,
    loading,
    isAuthenticated,
    iframeSDK, // Enhanced iframe SDK state
    iframeActions, // Iframe communication actions
  } = useWhopUser();

  // Check if iframe SDK is ready
  if (iframeSDK.isInitialized) {
    console.log("Iframe SDK ready!");
  }
}
```

### 2. Iframe Communication Hooks

#### `useWhopIframeUtils()`

Main hook for iframe communication:

```typescript
import { useWhopIframeUtils } from '@/lib/utils/iframe-utils';

function MyComponent() {
  const iframeUtils = useWhopIframeUtils();

  const handleAction = async () => {
    // Send notification to parent
    await iframeUtils.sendNotification({
      title: "Monitor Created",
      message: "Your new monitor is now active",
      type: "success"
    });

    // Track user action
    await iframeUtils.trackUserAction("monitor:created", {
      monitorId: "mon_123",
      url: "https://example.com"
    });
  };

  return (
    <button onClick={handleAction}>
      Create Monitor
    </button>
  );
}
```

#### `useMonitoringIframeUtils()`

Specialized hook for monitoring features:

```typescript
import { useMonitoringIframeUtils } from "@/lib/utils/iframe-utils";

function MonitorDashboard() {
  const monitoringUtils = useMonitoringIframeUtils();

  const updateStatus = async (monitorId: string, status: "up" | "down") => {
    await monitoringUtils.reportMonitorStatus(monitorId, status, 250);
  };

  const triggerAlert = async (alertId: string, monitorId: string) => {
    await monitoringUtils.reportAlertTriggered(
      alertId,
      monitorId,
      "Website is down",
    );
  };

  const updateMetrics = async () => {
    await monitoringUtils.updateDashboardMetrics(5, 2, 99.9);
  };
}
```

### 3. Automatic Features

The `WhopIframeInitializer` component (already added to your layout) provides:

- **Auto-resize**: Automatically adjusts iframe height based on content
- **Ready notification**: Tells parent when app is fully loaded
- **Error reporting**: Reports JavaScript errors to parent application

```typescript
// Already configured in app/layout.tsx
<WhopIframeInitializer
  autoResize={true}
  notifyReady={true}
  enableErrorReporting={true}
/>
```

## Message Types

The SDK supports structured communication through message types:

```typescript
enum WhopMessageType {
  READY = "app:ready", // App initialization complete
  HEIGHT_CHANGE = "app:height-change", // Content height changed
  NAVIGATION = "app:navigation", // Navigation request
  USER_ACTION = "app:user-action", // User performed action
  ERROR = "app:error", // Error occurred
  METRICS_UPDATE = "app:metrics-update", // Dashboard metrics update
  NOTIFICATION = "app:notification", // User notification
}
```

## Usage Examples

### 1. Reporting Monitor Status Changes

```typescript
import { useMonitoringIframeUtils } from "@/lib/utils/iframe-utils";

function MonitorCard({ monitor }) {
  const { reportMonitorStatus } = useMonitoringIframeUtils();

  useEffect(() => {
    // Report when monitor status changes
    if (monitor.status === "down") {
      reportMonitorStatus(monitor.id, "down", monitor.responseTime);
    }
  }, [monitor.status]);
}
```

### 2. Custom Navigation

```typescript
import { useWhopIframeUtils } from '@/lib/utils/iframe-utils';

function NavigationButton() {
  const { navigate } = useWhopIframeUtils();

  const goToSettings = async () => {
    await navigate('/settings', { tab: 'billing' });
  };

  return <button onClick={goToSettings}>Settings</button>;
}
```

### 3. Error Handling

```typescript
import { useWhopIframeUtils } from "@/lib/utils/iframe-utils";

function APIComponent() {
  const { reportError } = useWhopIframeUtils();

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data");
      if (!response.ok) throw new Error("API Error");
    } catch (error) {
      await reportError(error, "api-fetch");
    }
  };
}
```

### 4. Real-time Metrics

```typescript
import { useMonitoringIframeUtils } from "@/lib/utils/iframe-utils";

function DashboardHeader() {
  const { updateDashboardMetrics } = useMonitoringIframeUtils();

  useEffect(() => {
    const interval = setInterval(async () => {
      const stats = await getMonitoringStats();
      await updateDashboardMetrics(stats.monitors, stats.alerts, stats.uptime);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);
}
```

## Integration Benefits

### Enhanced User Experience

- **Smooth Resizing**: Content automatically adjusts iframe height
- **Real-time Feedback**: Instant notifications to parent application
- **Coordinated Navigation**: Seamless navigation between iframe and parent

### Better Analytics

- **User Action Tracking**: Detailed analytics on user behavior
- **Performance Metrics**: Real-time monitoring statistics
- **Error Monitoring**: Automatic error reporting and tracking

### Improved Reliability

- **Error Handling**: Graceful error reporting and recovery
- **Communication Validation**: Structured message validation
- **Fallback Support**: Works without parent communication if needed

## Development Features

In development mode, you'll see a status indicator in the top-right corner showing:

- ✅ **Green**: Iframe SDK is ready and functioning
- ❌ **Red**: SDK is loading or has errors
- Error details if something goes wrong

## Best Practices

### 1. Check SDK Status

Always check if the SDK is ready before using iframe features:

```typescript
const { isReady, error } = useWhopIframeUtils();

if (!isReady) {
  return <div>Loading iframe features...</div>;
}
```

### 2. Handle Errors Gracefully

Iframe communication can fail, so always handle errors:

```typescript
try {
  await iframeUtils.sendNotification(notification);
} catch (error) {
  console.log("Notification failed, showing fallback");
  showLocalNotification(notification);
}
```

### 3. Use Monitoring-Specific Utils

For monitoring features, use the specialized hook:

```typescript
// ✅ Good - specialized for monitoring
const { reportMonitorStatus } = useMonitoringIframeUtils();

// ❌ Less optimal - generic utils
const { trackUserAction } = useWhopIframeUtils();
```

### 4. Batch Metrics Updates

Don't send too many updates - batch them:

```typescript
// ✅ Good - batched update
const updateAllMetrics = async () => {
  const metrics = await calculateMetrics();
  await updateDashboardMetrics(
    metrics.monitors,
    metrics.alerts,
    metrics.uptime,
  );
};

// ❌ Bad - too many individual calls
await trackUserAction("monitor:checked");
await trackUserAction("alert:processed");
await trackUserAction("metric:calculated");
```

## Troubleshooting

### SDK Not Initializing

- Check browser console for errors
- Ensure you're running in iframe context
- Verify `@whop-apps/iframe` package is installed

### Messages Not Sending

- Check `iframeUtils.isReady` status
- Verify parent window supports postMessage
- Check for CSP restrictions

### Auto-resize Not Working

- Ensure content changes trigger DOM mutations
- Check for CSS that prevents height calculation
- Verify ResizeObserver is supported

## Migration from Basic Setup

If you're upgrading from basic Whop integration:

1. **No Breaking Changes**: All existing functionality continues to work
2. **Enhanced Features**: New iframe capabilities are additive
3. **Gradual Adoption**: Start using new features incrementally

## API Reference

### Hooks

- `useWhopIframeSDK()` - Core SDK state management
- `useWhopIframeActions()` - Basic communication actions
- `useWhopIframeUtils()` - Enhanced utilities and patterns
- `useMonitoringIframeUtils()` - Monitoring-specific utilities

### Components

- `<WhopIframeInitializer />` - Automatic setup and configuration

### Types

- `WhopMessageType` - Available message types
- `WhopMessage` - Message structure
- `NavigationMessage` - Navigation payloads
- `MetricsMessage` - Metrics update payloads
- `NotificationMessage` - Notification payloads

---

This enhanced iframe integration provides a foundation for building sophisticated, interactive applications within the Whop ecosystem while maintaining excellent user experience and platform integration.
