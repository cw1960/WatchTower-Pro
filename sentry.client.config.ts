import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment and release info
  environment: process.env.NODE_ENV || "development",
  release:
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NETLIFY_COMMIT_SHA ||
    "development",

  // Integration configuration
  integrations: [
    new Sentry.Replay({
      // Mask sensitive data
      maskAllText: false,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
    new Sentry.BrowserTracing({
      // Monitor page loads and navigation
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
  ],

  // Filter out noise
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === "development") {
      console.log("Sentry event (dev mode):", event);
      return null;
    }

    // Filter out known noise
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (
        error?.type === "ChunkLoadError" ||
        error?.value?.includes("Loading chunk") ||
        error?.value?.includes("Script error")
      ) {
        return null;
      }
    }

    return event;
  },

  // User context
  initialScope: {
    tags: {
      component: "client",
    },
  },
});
