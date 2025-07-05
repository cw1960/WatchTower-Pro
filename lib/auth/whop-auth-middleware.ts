import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

/**
 * Simple Whop authentication following official documentation
 * Based on: https://dev.whop.com/sdk/retrieve-current-user
 */
export async function validateWhopAuth() {
  try {
    const headersList = await headers();
    
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}
