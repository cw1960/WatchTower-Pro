import { WhopServerSdk } from "@whop/api";

// Lazy initialization of Whop SDK to avoid build-time errors
let _whopSdk: ReturnType<typeof WhopServerSdk> | null = null;

const initializeWhopSdk = () => {
	if (_whopSdk) return _whopSdk;
	
	// Check if we have required environment variables
	if (!process.env.NEXT_PUBLIC_WHOP_APP_ID || !process.env.WHOP_API_KEY) {
		throw new Error("Whop SDK not configured: Missing required environment variables");
	}
	
	_whopSdk = WhopServerSdk({
		// Add your app id here - this is required.
		// You can get this from the Whop dashboard after creating an app section.
		appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,

		// Add your app api key here - this is required.
		// You can get this from the Whop dashboard after creating an app section.
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
	
	return _whopSdk;
};

export const whopSdk = new Proxy({} as ReturnType<typeof WhopServerSdk>, {
	get(target, prop) {
		const sdk = initializeWhopSdk();
		return sdk[prop as keyof typeof sdk];
	}
});

// Plan type enum (will be moved to use Prisma enum once generated)
export enum PlanType {
	FREE = "FREE",
	STARTER = "STARTER",
	PROFESSIONAL = "PROFESSIONAL",
	ENTERPRISE = "ENTERPRISE",
}

// User authentication and validation utilities
export const whopAuth = {
	/**
	 * Validates if a user has access to the app
	 */
	async validateUserAccess(userId: string): Promise<boolean> {
		try {
			// Skip validation during build time
			if (process.env.NODE_ENV === "production" && !process.env.WHOP_API_KEY) {
				return false;
			}
			
			// Using the correct SDK method structure
			const user = await whopSdk.users.getCurrentUser();
			return !!user;
		} catch (error) {
			console.error("Error validating user access:", error);
			return false;
		}
	},

	/**
	 * Gets current user information from Whop
	 */
	async getCurrentUser() {
		try {
			// Skip during build time
			if (process.env.NODE_ENV === "production" && !process.env.WHOP_API_KEY) {
				return null;
			}
			
			const response = await whopSdk.users.getCurrentUser();
			return response.user;
		} catch (error) {
			console.error("Error getting current user:", error);
			return null;
		}
	},
};

// Pricing tier detection utilities
export const whopPricing = {
	/**
	 * Gets plan limits for a user based on plan type
	 */
	getPlanLimits(planType: PlanType) {
		const limits = {
			[PlanType.FREE]: {
				monitors: 3,
				checks_per_hour: 12,
				retention_days: 7,
				alerts: 1,
				team_members: 1,
			},
			[PlanType.STARTER]: {
				monitors: 10,
				checks_per_hour: 120,
				retention_days: 30,
				alerts: 5,
				team_members: 3,
			},
			[PlanType.PROFESSIONAL]: {
				monitors: 50,
				checks_per_hour: 600,
				retention_days: 90,
				alerts: 25,
				team_members: 10,
			},
			[PlanType.ENTERPRISE]: {
				monitors: -1, // unlimited
				checks_per_hour: -1, // unlimited
				retention_days: 365,
				alerts: -1, // unlimited
				team_members: -1, // unlimited
			},
		};

		return limits[planType];
	},

	/**
	 * Checks if user has access to a specific feature based on their plan
	 */
	hasFeatureAccess(planType: PlanType, feature: string): boolean {
		const featureMatrix = {
			[PlanType.FREE]: ["basic_monitoring"],
			[PlanType.STARTER]: ["basic_monitoring", "email_alerts", "5_monitors"],
			[PlanType.PROFESSIONAL]: ["basic_monitoring", "email_alerts", "slack_integration", "25_monitors", "whop_metrics"],
			[PlanType.ENTERPRISE]: ["basic_monitoring", "email_alerts", "slack_integration", "unlimited_monitors", "whop_metrics", "custom_webhooks", "api_access"],
		};

		return featureMatrix[planType]?.includes(feature) || false;
	},
};

// Company access helpers
export const whopCompany = {
	/**
	 * Gets company information using the configured SDK
	 */
	async getCompanyInfo(companyId?: string) {
		try {
			const id = companyId || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
			if (!id) {
				throw new Error("Company ID not provided");
			}

			// This will be updated once we have the correct SDK methods
			return {
				id,
				name: "Company Name",
				// Add other company properties as needed
			};
		} catch (error) {
			console.error("Error getting company info:", error);
			return null;
		}
	},
};

// Utility functions for WatchTower Pro
export const watchTowerUtils = {
	/**
	 * Determines if a user can create more monitors based on their plan
	 */
	canCreateMonitor(currentMonitorCount: number, planType: PlanType): boolean {
		const limits = whopPricing.getPlanLimits(planType);
		if (limits.monitors === -1) return true; // unlimited
		return currentMonitorCount < limits.monitors;
	},

	/**
	 * Gets the monitoring frequency allowed for a plan
	 */
	getMonitoringFrequency(planType: PlanType): number {
		const limits = whopPricing.getPlanLimits(planType);
		return Math.max(300, 3600 / limits.checks_per_hour); // minimum 5 minutes
	},

	/**
	 * Checks if a user can access Whop-specific monitoring features
	 */
	canAccessWhopMetrics(planType: PlanType): boolean {
		return whopPricing.hasFeatureAccess(planType, "whop_metrics");
	},
};
