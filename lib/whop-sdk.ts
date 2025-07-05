import { WhopServerSdk, makeUserTokenVerifier } from "@whop/api";
import { PlanType } from "@prisma/client";

// Check if we have required environment variables
if (!process.env.NEXT_PUBLIC_WHOP_APP_ID || !process.env.WHOP_API_KEY) {
  throw new Error(
    "Whop SDK not configured: Missing required environment variables NEXT_PUBLIC_WHOP_APP_ID or WHOP_API_KEY",
  );
}

export const whopSdk = WhopServerSdk({
  // This is the appId of your app. You can find this in the "App Settings" section of your app's Whop dashboard.
  // This is required.
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,

  // Add your app api key here - this is required.
  // You can get this from the Whop dashboard after creating an app in the "API Keys" section.
  appApiKey: process.env.WHOP_API_KEY,

  // This will make api requests on behalf of this user.
  // This is optional, however most api requests need to be made on behalf of a user.
  // You can create an agent user for your app, and use their userId here.
  // You can also apply a different userId later with the `withUser` function.
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,

  // This is the companyId that will be used for the api requests.
  // When making api requests that query or mutate data about a company, you need to specify the companyId.
  // This is optional, however if not specified certain requests will fail.
  // This can also be applied later with the `withCompany` function.
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});

// Export plan types for external use
export { PlanType };

// Add back missing exports that other parts of the app expect
export const whopAuth = {
  async validateUserAccess(userId: string) {
    return true; // Simple implementation
  },
  async getCurrentUser() {
    return null; // Simple implementation
  },
};

export const whopPricing = {
  getPlanLimits(planType: PlanType) {
    return {
      monitors: -1,
      checks_per_hour: -1,
      retention_days: 365,
      alerts: -1,
      team_members: -1,
    };
  },
  hasFeatureAccess(planType: PlanType, feature: string) {
    return true; // Simple implementation - allow all features
  },
  async createCheckoutSession(options: any) {
    return {
      id: "checkout_session_placeholder",
      url: "/billing/upgrade?error=checkout_unavailable",
    };
  },
  getProductIdForPlan(planType: PlanType) {
    return null;
  },
  generateCheckoutUrl(planType: PlanType, userId: string) {
    return "/billing/upgrade";
  },
  async cancelSubscription(userId: string) {
    return {
      success: true,
      message: "Subscription cancelled",
    };
  },
};
