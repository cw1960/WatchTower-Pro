import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment and release info
  environment: process.env.NODE_ENV || "development",
  release:
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NETLIFY_COMMIT_SHA ||
    "development",

  // Server-specific integrations
  integrations: [
    Sentry.httpIntegration(),
    Sentry.prismaIntegration(), // Will be set up when Prisma client is available
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
        error?.type === "DatabaseConnectionError" &&
        error?.value?.includes("localhost:5432")
      ) {
        // Don't report development database connection errors
        return null;
      }
    }

    return event;
  },

  // Server context
  initialScope: {
    tags: {
      component: "server",
    },
  },

  // Debugging
  debug: process.env.NODE_ENV === "development",
});
