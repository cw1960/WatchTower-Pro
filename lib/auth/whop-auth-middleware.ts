import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

/**
 * Simple Whop authentication following official documentation
 * Based on: https://dev.whop.com/sdk/retrieve-current-user
 */
export async function validateWhopAuth() {
  try {
    const headersList = await headers();
    
    // Debug: Log all headers to understand what we're receiving
    console.log("🔍 All headers received:");
    const allHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      allHeaders[key] = value;
      console.log(`  ${key}: ${value}`);
    });
    
    // Check specifically for Whop-related headers
    const whopUserToken = headersList.get('x-whop-user-token');
    const whopUserTokenCookie = headersList.get('cookie')?.split(';').find(c => c.trim().startsWith('whop_user_token='));
    
    console.log("🔍 Whop-specific headers:");
    console.log(`  x-whop-user-token: ${whopUserToken}`);
    console.log(`  whop_user_token cookie: ${whopUserTokenCookie}`);
    
    if (!whopUserToken && !whopUserTokenCookie) {
      console.log("❌ No Whop user token found in headers or cookies");
      return {
        success: false,
        error: "Whop user token not found. If you are the app developer, ensure you are developing in the whop.com iframe and have the dev proxy enabled.",
      };
    }
    
    // Extract the user ID (read from a verified auth JWT token)
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    console.log("✅ User authenticated:", userId);
    
    // Load the user's public profile information
    const user = await whopSdk.users.getUser({ userId: userId });
    
    console.log("✅ User profile loaded:", user?.name);
    
    return {
      success: true,
      user: {
        id: userId,
        whopId: userId,
        email: user?.username ? `${user.username}@whop.com` : `${userId}@whop.com`,
        name: user?.name || "Whop User",
        avatar: user?.profilePicture?.sourceUrl || null,
        plan: "PROFESSIONAL", // Default plan
        accessLevel: "customer", // Default access level
        hasAccess: true,
      }
    };
  } catch (error) {
    console.error("❌ Authentication failed:", error);
    console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack");
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

// Add back missing exports that other parts of the app expect
export async function requireWhopAuthForPage() {
  const authResult = await validateWhopAuth();
  if (!authResult.success || !authResult.user) {
    return { redirect: "/auth/login" };
  }
  return { user: authResult.user };
}

export async function getCurrentWhopUser() {
  try {
    const authResult = await validateWhopAuth();
    return authResult.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function checkUsageLimit(user: any, action: string) {
  // Simple implementation - allow everything for now
  return {
    allowed: true,
    limit: -1,
    current: 0,
  };
}

export async function logoutUser(userId: string) {
  // Simple implementation
  console.log("Logout user:", userId);
}
