import { PrismaClient } from "@prisma/client";
import { logger } from "./utils/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Production database configuration
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
    // Connection pooling configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Log slow queries in production
  client.$on("query", (e) => {
    if (e.duration > 1000) {
      logger.warn(`Slow query detected: ${e.query} (${e.duration}ms)`, {
        component: "database",
        action: "slow_query",
        metadata: {
          query: e.query,
          duration: e.duration,
          params: e.params,
        },
      });
    } else if (process.env.NODE_ENV === "development") {
      logger.debug(`Database query: ${e.query} (${e.duration}ms)`);
    }
  });

  // Log database errors
  client.$on("error", (e) => {
    logger.error(`Database error: ${e.message}`, undefined, {
      component: "database",
      action: "error",
      metadata: {
        target: e.target,
      },
    });
  });

  // Log database warnings
  client.$on("warn", (e) => {
    logger.warn(`Database warning: ${e.message}`, {
      component: "database",
      action: "warning",
      metadata: {
        target: e.target,
      },
    });
  });

  return client;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Connection health check
export async function healthCheck(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error("Database health check failed", error as Error, {
      component: "database",
      action: "health_check",
    });
    return false;
  }
}

// Graceful shutdown
export async function disconnectDb(): Promise<void> {
  try {
    await db.$disconnect();
    logger.info("Database connection closed gracefully", {
      component: "database",
      action: "disconnect",
    });
  } catch (error) {
    logger.error("Error during database disconnect", error as Error, {
      component: "database",
      action: "disconnect_error",
    });
  }
}

// Transaction wrapper with automatic retry
export async function withTransaction<T>(
  operation: (tx: any) => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const result = await db.$transaction(operation);
      const duration = Date.now() - startTime;

      logger.performance("Database transaction", duration, {
        component: "database",
        action: "transaction",
        metadata: {
          attempt,
          maxRetries,
        },
      });

      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        logger.error(
          `Transaction failed after ${maxRetries} attempts: ${lastError.message}`,
          lastError,
          {
            component: "database",
            action: "transaction_failed",
            metadata: {
              attempts: maxRetries,
            },
          },
        );
        throw lastError;
      }

      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      logger.warn(
        `Transaction attempt ${attempt} failed, retrying in ${delay}ms: ${lastError.message}`,
        {
          component: "database",
          action: "transaction_retry",
          metadata: {
            attempt,
            maxRetries,
            delay,
          },
        },
      );
    }
  }

  throw lastError;
}

// Query performance tracking
export function withQueryPerformance<
  T extends (...args: any[]) => Promise<any>,
>(queryFn: T, queryName: string): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    try {
      const result = await queryFn(...args);
      const duration = Date.now() - startTime;

      logger.performance(`Database query: ${queryName}`, duration, {
        component: "database",
        action: "query_performance",
        metadata: {
          queryName,
          argsCount: args.length,
        },
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        `Database query failed: ${queryName} (${duration}ms)`,
        error as Error,
        {
          component: "database",
          action: "query_error",
          metadata: {
            queryName,
            duration,
          },
        },
      );
      throw error;
    }
  }) as T;
}
