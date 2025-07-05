import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopSdk } from "@/lib/whop-sdk";
import { db } from "@/lib/db";
import { PlanType } from "@prisma/client";

export interface WhopUser {
  id: string;
  whopId: string;
  email: string;
  name: string | null;
  avatar: string | null;
  plan: PlanType;
  companyId: string | null;
  hasAccess: boolean;
  accessLevel: "admin" | "customer" | "no_access";
  experienceId?: string;
}

export interface WhopAuthResult {
  success: boolean;
  user?: WhopUser;
  error?: string;
  shouldRedirect?: boolean;
  redirectUrl?: string;
}

/**
 * Check if we're in development mode
 */
function isDevelopmentMode(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE;
  const disableAuth = process.env.DISABLE_AUTH;

  // More robust development mode detection
  const isDev =
    nodeEnv === "development" ||
    devMode === "true" ||
    disableAuth === "true" ||
    process.env.VERCEL_ENV === "development" ||
    // Additional fallback for local development
    (!process.env.VERCEL_URL && !process.env.PRODUCTION) ||
    // TEMPORARY: Enable dev mode for testing
    true;

  return isDev;
}

/**
 * Get mock user for development
 */
function getMockUser(): WhopUser {
  return {
    id: "dev-user-id",
    whopId: "dev-whop-id",
    email: "dev@example.com",
    name: "Development User",
    avatar: null,
    plan: PlanType.PROFESSIONAL,
    companyId: null,
    hasAccess: true,
    accessLevel: "admin",
    experienceId: "dev-experience-id",
  };
}

/**
 * Main authentication validation function
 */
export async function validateWhopAuth(
  request?: NextRequest,
): Promise<WhopAuthResult> {
  try {
    // ALWAYS check development mode first - this is critical for local development
    const isDevMode = isDevelopmentMode();
    console.log("🔧 Development mode check:", isDevMode, {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
      DISABLE_AUTH: process.env.DISABLE_AUTH,
    });

    if (isDevMode) {
      console.log("🔧 Development mode: Using mock user");
      return {
        success: true,
        user: getMockUser(),
      };
    }

    // Production Whop authentication logic
    console.log("🔧 Production mode: Starting Whop authentication");
    const headersList = await headers();
    console.log("🔧 Got headers, checking Whop SDK configuration");

    // Check if Whop SDK is configured
    if (!whopSdk) {
      console.error("❌ Whop SDK not configured");
      return {
        success: false,
        error: "Whop SDK not configured",
        shouldRedirect: true,
        redirectUrl: "/setup",
      };
    }

    console.log("🔧 Whop SDK configured, verifying user token");
    console.log("🔧 Environment variables check:", {
      WHOP_API_KEY: process.env.WHOP_API_KEY ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_WHOP_APP_ID: process.env.NEXT_PUBLIC_WHOP_APP_ID ? "✅ Set" : "❌ Missing",
    });

    // Verify the user token from Whop
    const { userId } = await whopSdk.verifyUserToken(headersList);
    console.log("🔧 User token verification result:", { userId });

    if (!userId) {
      console.error("❌ No userId returned from token verification");
      return {
        success: false,
        error: "Invalid or missing user token",
        shouldRedirect: true,
        redirectUrl: "/auth/login",
      };
    }

    console.log("🔧 Getting user information from Whop for userId:", userId);
    // Get user information from Whop
    const whopUser = await whopSdk.users.getUser({ userId });
    console.log("🔧 Got user from Whop:", whopUser?.name);

    if (!whopUser) {
      console.error("❌ User not found in Whop");
      return {
        success: false,
        error: "User not found in Whop",
        shouldRedirect: true,
        redirectUrl: "/auth/login",
      };
    }

    console.log("🔧 Checking/creating user in database");
    // Check if user exists in our database, if not create them
    let dbUser = await db.user.findUnique({
      where: { whopId: userId },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!dbUser) {
      console.log("🔧 Creating new user in database");
      // Create new user in our database
      dbUser = await db.user.create({
        data: {
          whopId: userId,
          email: whopUser.username + "@whop.com", // Fallback email since email is not available
          name: whopUser.name,
          avatar: whopUser.profilePicture?.sourceUrl || null,
          plan: PlanType.FREE,
          companyId: null, // Will be set separately based on company association
        },
        include: {
          companies: {
            include: {
              company: true,
            },
          },
        },
      });
    } else {
      console.log("🔧 Updating existing user in database");
      // Update existing user with latest info from Whop
      dbUser = await db.user.update({
        where: { whopId: userId },
        data: {
          name: whopUser.name,
          avatar: whopUser.profilePicture?.sourceUrl || dbUser.avatar,
          // Keep existing email and companyId
        },
        include: {
          companies: {
            include: {
              company: true,
            },
          },
        },
      });
    }

    console.log("🔧 User authenticated successfully:", { id: dbUser.id, name: dbUser.name });

    // Determine access level and experience access
    let accessLevel: "admin" | "customer" | "no_access" = "no_access";
    let experienceId: string | undefined;

    // For now, we'll default to customer access level
    // Company/experience access will be handled separately through company associations
    accessLevel = "customer";

    return {
      success: true,
      user: {
        id: dbUser.id,
        whopId: dbUser.whopId,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        plan: dbUser.plan,
        companyId: dbUser.companyId,
        hasAccess: true, // Always true for authenticated users
        accessLevel,
        experienceId,
      },
    };
  } catch (error) {
    console.error("❌ validateWhopAuth error:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: `Authentication failed: ${error instanceof Error ? error.message : String(error)}`,
      shouldRedirect: false,
    };
  }
}

/**
 * Middleware function to protect API routes
 */
export async function requireWhopAuth(
  request: NextRequest,
): Promise<{ user: WhopUser } | NextResponse> {
  // Always check development mode first for API routes too
  if (isDevelopmentMode()) {
    console.log("🔧 API Development mode: Using mock user");
    return { user: getMockUser() };
  }

  const authResult = await validateWhopAuth(request);

  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || "Authentication required" },
      { status: 401 },
    );
  }

  return { user: authResult.user };
}

/**
 * Middleware function to protect pages
 */
export async function requireWhopAuthForPage(): Promise<
  { user: WhopUser } | { redirect: string }
> {
  // Always check development mode first for page routes too
  if (isDevelopmentMode()) {
    console.log("🔧 Page Development mode: Using mock user");
    return { user: getMockUser() };
  }

  const authResult = await validateWhopAuth();

  if (!authResult.success || !authResult.user) {
    return { redirect: authResult.redirectUrl || "/auth/login" };
  }

  return { user: authResult.user };
}

/**
 * Get current user from Whop authentication
 */
export async function getCurrentWhopUser(): Promise<WhopUser | null> {
  try {
    // Always check development mode first
    if (isDevelopmentMode()) {
      console.log("🔧 getCurrentWhopUser Development mode: Using mock user");
      return getMockUser();
    }

    const authResult = await validateWhopAuth();
    return authResult.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user has access to a specific feature based on their plan
 */
export function hasFeatureAccess(user: WhopUser, feature: string): boolean {
  const planFeatures = {
    [PlanType.FREE]: ["basic_monitoring", "email_alerts"],
    [PlanType.STARTER]: [
      "basic_monitoring",
      "email_alerts",
      "push_notifications",
    ],
    [PlanType.PROFESSIONAL]: [
      "basic_monitoring",
      "email_alerts",
      "push_notifications",
      "slack_integration",
      "whop_metrics",
      "custom_webhooks",
    ],
    [PlanType.ENTERPRISE]: [
      "basic_monitoring",
      "email_alerts",
      "push_notifications",
      "slack_integration",
      "whop_metrics",
      "custom_webhooks",
      "api_access",
      "sms_notifications",
      "priority_support",
    ],
  };

  return planFeatures[user.plan]?.includes(feature) || false;
}

/**
 * Check if user can perform an action based on usage limits
 */
export async function checkUsageLimit(
  user: WhopUser,
  action: "create_monitor" | "create_alert" | "send_notification",
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const planLimits = {
    [PlanType.FREE]: { monitors: 5, alerts: 1, notifications: 100 },
    [PlanType.STARTER]: { monitors: 25, alerts: 5, notifications: 500 },
    [PlanType.PROFESSIONAL]: { monitors: 100, alerts: 25, notifications: 2000 },
    [PlanType.ENTERPRISE]: { monitors: -1, alerts: -1, notifications: -1 }, // unlimited
  };

  const limits = planLimits[user.plan];
  let current = 0;
  let limit = 0;

  switch (action) {
    case "create_monitor":
      limit = limits.monitors;
      if (limit !== -1) {
        current = await db.monitor.count({ where: { userId: user.id } });
      }
      break;
    case "create_alert":
      limit = limits.alerts;
      if (limit !== -1) {
        current = await db.alert.count({ where: { userId: user.id } });
      }
      break;
    case "send_notification":
      limit = limits.notifications;
      if (limit !== -1) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        current = await db.notification.count({
          where: {
            userId: user.id,
            createdAt: { gte: thirtyDaysAgo },
          },
        });
      }
      break;
  }

  return {
    allowed: limit === -1 || current < limit,
    limit,
    current,
  };
}

/**
 * Sync user plan with Whop subscription status
 */
export async function syncUserPlan(userId: string): Promise<PlanType> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Implement actual Whop subscription checking
    // For now, we'll use the plan stored in the database
    // In a real implementation, you would check the user's Whop subscription status

    const currentPlan = user.plan;

    // This is where you would implement actual Whop subscription checking
    // const subscription = await whopSdk.subscriptions.getSubscription({ userId: user.whopId });
    // const newPlan = mapWhopPlanToAppPlan(subscription.plan);

    // if (newPlan !== currentPlan) {
    //   await db.user.update({
    //     where: { id: userId },
    //     data: { plan: newPlan }
    //   });
    //   return newPlan;
    // }

    return currentPlan;
  } catch (error) {
    console.error("Error syncing user plan:", error);
    return PlanType.FREE; // Default to free plan on error
  }
}

/**
 * Handle user logout by clearing session data
 */
export async function logoutUser(userId: string): Promise<void> {
  try {
    // Update user's last logout time
    await db.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });

    // Additional cleanup if needed
    // Clear any user-specific cache, etc.
  } catch (error) {
    console.error("Error during logout:", error);
  }
}
