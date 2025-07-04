import { whopSdk } from "@/lib/whop-sdk";
import { ScrapedData } from "./scraper";

export interface WhopMetricsConfig {
  companyId: string;
  experienceId?: string;
  accessPassId?: string;
  productId?: string;
  trackMemberships?: boolean;
  trackRevenue?: boolean;
  trackCommunity?: boolean;
  trackAccessPass?: boolean;
  customMetrics?: string[];
}

export interface WhopMembershipMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersToday: number;
  newMembersThisWeek: number;
  newMembersThisMonth: number;
  churnRate: number;
  membersByProduct: Record<string, number>;
  membersByStatus: Record<string, number>;
}

export interface WhopRevenueMetrics {
  totalBalance: number;
  pendingBalance: number;
  currency: string;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  totalTransactions: number;
  revenueByProduct: Record<string, number>;
}

export interface WhopCommunityMetrics {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  messagesThisWeek: number;
  averageResponseTime: number;
  mostActiveUsers: Array<{
    userId: string;
    messageCount: number;
    username?: string;
  }>;
  engagementRate: number;
}

export interface WhopAccessPassMetrics {
  totalViews: number;
  activeUsers: number;
  conversionRate: number;
  visibility: string;
  verified: boolean;
  reviewsAverage: number;
  waitlistCount: number;
  galleryImageCount: number;
}

export interface WhopMetricsResult {
  success: boolean;
  timestamp: Date;
  companyId: string;
  membershipMetrics?: WhopMembershipMetrics;
  revenueMetrics?: WhopRevenueMetrics;
  communityMetrics?: WhopCommunityMetrics;
  accessPassMetrics?: WhopAccessPassMetrics;
  error?: string;
  responseTime: number;
}

export class WhopMetricsCollector {
  private config: WhopMetricsConfig;

  constructor(config: WhopMetricsConfig) {
    this.config = config;
  }

  async collectMetrics(): Promise<WhopMetricsResult> {
    const startTime = Date.now();

    try {
      const result: WhopMetricsResult = {
        success: true,
        timestamp: new Date(),
        companyId: this.config.companyId,
        responseTime: 0,
      };

      // Collect membership metrics if enabled
      if (this.config.trackMemberships) {
        result.membershipMetrics = await this.collectMembershipMetrics();
      }

      // Collect revenue metrics if enabled
      if (this.config.trackRevenue) {
        result.revenueMetrics = await this.collectRevenueMetrics();
      }

      // Collect community metrics if enabled
      if (this.config.trackCommunity) {
        result.communityMetrics = await this.collectCommunityMetrics();
      }

      // Collect access pass metrics if enabled
      if (this.config.trackAccessPass && this.config.accessPassId) {
        result.accessPassMetrics = await this.collectAccessPassMetrics();
      }

      result.responseTime = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        success: false,
        timestamp: new Date(),
        companyId: this.config.companyId,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async collectMembershipMetrics(): Promise<WhopMembershipMetrics> {
    try {
      // Note: Using placeholder logic since exact API structure needs to be determined
      // This would be replaced with actual Whop SDK calls once API structure is confirmed

      // Placeholder for membership data collection
      const membershipData = {
        totalMembers: 0,
        activeMembers: 0,
        newMembersToday: 0,
        newMembersThisWeek: 0,
        newMembersThisMonth: 0,
        churnRate: 0,
        membersByProduct: {} as Record<string, number>,
        membersByStatus: {} as Record<string, number>,
      };

      // TODO: Implement actual Whop API calls when SDK structure is confirmed
      // Example structure (to be replaced):
      // const response = await whopSdk.someApi.getMemberships({
      //   companyId: this.config.companyId
      // });

      return membershipData;
    } catch (error) {
      console.error("Error collecting membership metrics:", error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        newMembersToday: 0,
        newMembersThisWeek: 0,
        newMembersThisMonth: 0,
        churnRate: 0,
        membersByProduct: {},
        membersByStatus: {},
      };
    }
  }

  private async collectRevenueMetrics(): Promise<WhopRevenueMetrics> {
    try {
      // Get company ledger account
      const ledgerResponse = await whopSdk.companies.getCompanyLedgerAccount({
        companyId: this.config.companyId,
      });

      if (!ledgerResponse || !ledgerResponse.ledgerAccount) {
        throw new Error("No ledger account found");
      }

      const ledgerAccount = ledgerResponse.ledgerAccount;

      // Extract balance information
      const balances = ledgerAccount.balanceCaches?.nodes || [];
      const primaryBalance = balances[0] || {
        balance: 0,
        pendingBalance: 0,
        currency: "usd",
      };

      // Get recent transactions for revenue calculation
      // Note: This would need additional API calls for detailed transaction history
      // For now, we'll use the balance as primary metrics

      return {
        totalBalance: primaryBalance.balance || 0,
        pendingBalance: primaryBalance.pendingBalance || 0,
        currency: primaryBalance.currency || "usd",
        dailyRevenue: 0, // Would need transaction history
        weeklyRevenue: 0, // Would need transaction history
        monthlyRevenue: 0, // Would need transaction history
        averageOrderValue: 0, // Would need transaction history
        totalTransactions: 0, // Would need transaction history
        revenueByProduct: {}, // Would need detailed transaction breakdown
      };
    } catch (error) {
      console.error("Error collecting revenue metrics:", error);
      return {
        totalBalance: 0,
        pendingBalance: 0,
        currency: "usd",
        dailyRevenue: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0,
        averageOrderValue: 0,
        totalTransactions: 0,
        revenueByProduct: {},
      };
    }
  }

  private async collectCommunityMetrics(): Promise<WhopCommunityMetrics> {
    try {
      // Get direct message conversations
      const conversationsResponse =
        await whopSdk.messages.listDirectMessageConversations({
          limit: 100,
          unread: undefined, // Get all conversations
        });

      // The response is an array of conversations
      const conversations = Array.isArray(conversationsResponse)
        ? conversationsResponse
        : [];

      // Calculate basic community metrics
      const totalConversations = conversations.length;
      const activeConversations = conversations.filter(
        (conv: any) => conv.status === "accepted",
      ).length;

      // Get recent message activity (this would need more detailed API calls)
      const now = new Date();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Note: Full message history would require additional API calls
      // This is a simplified implementation
      const messagesThisWeek = 0; // Would need message history API

      return {
        totalConversations,
        activeConversations,
        totalMessages: 0, // Would need message count API
        messagesThisWeek,
        averageResponseTime: 0, // Would need message timing analysis
        mostActiveUsers: [], // Would need user activity analysis
        engagementRate:
          activeConversations > 0
            ? (activeConversations / totalConversations) * 100
            : 0,
      };
    } catch (error) {
      console.error("Error collecting community metrics:", error);
      return {
        totalConversations: 0,
        activeConversations: 0,
        totalMessages: 0,
        messagesThisWeek: 0,
        averageResponseTime: 0,
        mostActiveUsers: [],
        engagementRate: 0,
      };
    }
  }

  private async collectAccessPassMetrics(): Promise<WhopAccessPassMetrics> {
    try {
      if (!this.config.accessPassId) {
        throw new Error("Access Pass ID not provided");
      }

      // Get access pass information
      const accessPassResponse = await whopSdk.accessPasses.getAccessPass({
        accessPassId: this.config.accessPassId,
      });

      // The response is the access pass object directly
      const accessPass = accessPassResponse;

      if (!accessPass) {
        throw new Error("Access pass not found");
      }

      // Get waitlist entries
      let waitlistCount = 0;
      try {
        const waitlistResponse =
          await whopSdk.companies.getWaitlistEntriesForCompany({
            companyId: this.config.companyId,
            first: 100,
          });

        if (waitlistResponse?.creatorDashboardTable?.entries) {
          waitlistCount =
            waitlistResponse.creatorDashboardTable.entries.totalCount || 0;
        }
      } catch (error) {
        console.warn("Could not fetch waitlist data:", error);
      }

      return {
        totalViews: 0, // Would need analytics API
        activeUsers: accessPass.activeUsersCount || 0,
        conversionRate: 0, // Would need conversion tracking
        visibility: accessPass.visibility || "hidden",
        verified: accessPass.verified || false,
        reviewsAverage: accessPass.reviewsAverage || 0,
        waitlistCount,
        galleryImageCount: 0, // Would need gallery images API
      };
    } catch (error) {
      console.error("Error collecting access pass metrics:", error);
      return {
        totalViews: 0,
        activeUsers: 0,
        conversionRate: 0,
        visibility: "hidden",
        verified: false,
        reviewsAverage: 0,
        waitlistCount: 0,
        galleryImageCount: 0,
      };
    }
  }

  // Convert Whop metrics to ScrapedData format for compatibility
  toScrapedData(result: WhopMetricsResult): ScrapedData {
    const data: ScrapedData = {
      title: `Whop Metrics - ${this.config.companyId}`,
      statusCode: result.success ? 200 : 500,
      metrics: [],
    };

    // Add membership metrics
    if (result.membershipMetrics) {
      const metrics = result.membershipMetrics;
      data.metrics?.push(
        {
          name: "total_members",
          value: metrics.totalMembers,
          unit: "count",
          selector: "whop-api",
          element: "membership-total",
        },
        {
          name: "active_members",
          value: metrics.activeMembers,
          unit: "count",
          selector: "whop-api",
          element: "membership-active",
        },
        {
          name: "new_members_today",
          value: metrics.newMembersToday,
          unit: "count",
          selector: "whop-api",
          element: "membership-new-today",
        },
        {
          name: "new_members_week",
          value: metrics.newMembersThisWeek,
          unit: "count",
          selector: "whop-api",
          element: "membership-new-week",
        },
        {
          name: "new_members_month",
          value: metrics.newMembersThisMonth,
          unit: "count",
          selector: "whop-api",
          element: "membership-new-month",
        },
        {
          name: "churn_rate",
          value: metrics.churnRate,
          unit: "percentage",
          selector: "whop-api",
          element: "membership-churn",
        },
      );
    }

    // Add revenue metrics
    if (result.revenueMetrics) {
      const metrics = result.revenueMetrics;
      data.metrics?.push(
        {
          name: "total_balance",
          value: metrics.totalBalance,
          unit: metrics.currency,
          selector: "whop-api",
          element: "revenue-balance",
        },
        {
          name: "pending_balance",
          value: metrics.pendingBalance,
          unit: metrics.currency,
          selector: "whop-api",
          element: "revenue-pending",
        },
        {
          name: "daily_revenue",
          value: metrics.dailyRevenue,
          unit: metrics.currency,
          selector: "whop-api",
          element: "revenue-daily",
        },
        {
          name: "weekly_revenue",
          value: metrics.weeklyRevenue,
          unit: metrics.currency,
          selector: "whop-api",
          element: "revenue-weekly",
        },
        {
          name: "monthly_revenue",
          value: metrics.monthlyRevenue,
          unit: metrics.currency,
          selector: "whop-api",
          element: "revenue-monthly",
        },
      );
    }

    // Add community metrics
    if (result.communityMetrics) {
      const metrics = result.communityMetrics;
      data.metrics?.push(
        {
          name: "total_conversations",
          value: metrics.totalConversations,
          unit: "count",
          selector: "whop-api",
          element: "community-conversations",
        },
        {
          name: "active_conversations",
          value: metrics.activeConversations,
          unit: "count",
          selector: "whop-api",
          element: "community-active",
        },
        {
          name: "engagement_rate",
          value: metrics.engagementRate,
          unit: "percentage",
          selector: "whop-api",
          element: "community-engagement",
        },
      );
    }

    // Add access pass metrics
    if (result.accessPassMetrics) {
      const metrics = result.accessPassMetrics;
      data.metrics?.push(
        {
          name: "active_users",
          value: metrics.activeUsers,
          unit: "count",
          selector: "whop-api",
          element: "access-pass-users",
        },
        {
          name: "reviews_average",
          value: metrics.reviewsAverage,
          unit: "rating",
          selector: "whop-api",
          element: "access-pass-reviews",
        },
        {
          name: "waitlist_count",
          value: metrics.waitlistCount,
          unit: "count",
          selector: "whop-api",
          element: "access-pass-waitlist",
        },
        {
          name: "gallery_images",
          value: metrics.galleryImageCount,
          unit: "count",
          selector: "whop-api",
          element: "access-pass-gallery",
        },
      );
    }

    return data;
  }
}

// Utility functions for Whop monitoring
export const WhopMonitoringUtils = {
  /**
   * Create a membership count monitor configuration
   */
  createMembershipMonitor: (
    companyId: string,
    experienceId?: string,
  ): WhopMetricsConfig => ({
    companyId,
    experienceId,
    trackMemberships: true,
    trackRevenue: false,
    trackCommunity: false,
    trackAccessPass: false,
  }),

  /**
   * Create a revenue monitoring configuration
   */
  createRevenueMonitor: (companyId: string): WhopMetricsConfig => ({
    companyId,
    trackMemberships: false,
    trackRevenue: true,
    trackCommunity: false,
    trackAccessPass: false,
  }),

  /**
   * Create a community activity monitor configuration
   */
  createCommunityMonitor: (companyId: string): WhopMetricsConfig => ({
    companyId,
    trackMemberships: false,
    trackRevenue: false,
    trackCommunity: true,
    trackAccessPass: false,
  }),

  /**
   * Create an access pass performance monitor configuration
   */
  createAccessPassMonitor: (
    companyId: string,
    accessPassId: string,
  ): WhopMetricsConfig => ({
    companyId,
    accessPassId,
    trackMemberships: false,
    trackRevenue: false,
    trackCommunity: false,
    trackAccessPass: true,
  }),

  /**
   * Create a comprehensive Whop monitor configuration
   */
  createComprehensiveMonitor: (
    companyId: string,
    accessPassId?: string,
  ): WhopMetricsConfig => ({
    companyId,
    accessPassId,
    trackMemberships: true,
    trackRevenue: true,
    trackCommunity: true,
    trackAccessPass: !!accessPassId,
  }),
};

export default WhopMetricsCollector;
