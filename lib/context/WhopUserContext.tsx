"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { PlanType } from "@prisma/client";
import {
  useWhopIframeSDK,
  useWhopIframeActions,
} from "@/lib/hooks/useWhopIframeSDK";

// Define WhopUser type locally
export interface WhopUser {
  id: string;
  whopId: string;
  email: string;
  name: string;
  avatar: string | null;
  plan: string;
  accessLevel: string;
  hasAccess: boolean;
}

interface WhopUserContextType {
  user: WhopUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  updateUserPlan: (plan: PlanType) => Promise<void>;
  logout: () => Promise<void>;
  // Enhanced iframe capabilities
  iframeSDK: {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
    sdk: any | null;
  };
  iframeActions: {
    sendMessage: (message: any) => Promise<any>;
    requestData: (dataType: string) => Promise<any>;
    updateHeight: (height: number) => Promise<any>;
    notifyReady: () => Promise<any>;
    isReady: boolean;
    error: string | null;
  };
}

const WhopUserContext = createContext<WhopUserContextType | undefined>(
  undefined,
);

interface WhopUserProviderProps {
  children: ReactNode;
  initialUser?: WhopUser | null;
}

export function WhopUserProvider({
  children,
  initialUser,
}: WhopUserProviderProps) {
  const [user, setUser] = useState<WhopUser | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);

  // Initialize iframe SDK hooks
  const iframeSDK = useWhopIframeSDK();
  const iframeActions = useWhopIframeActions();

  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // User is not authenticated
        setUser(null);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (plan: PlanType) => {
    try {
      const response = await fetch("/api/auth/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        credentials: "include",
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        throw new Error("Failed to update plan");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        // Redirect to home page or login page
        window.location.href = "/";
      } else {
        throw new Error("Failed to logout");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
    }
  };

  // Load user data on mount if not provided initially
  useEffect(() => {
    if (!initialUser) {
      refreshUser();
    }
  }, [initialUser]);

  const value: WhopUserContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    refreshUser,
    updateUserPlan,
    logout,
    iframeSDK,
    iframeActions,
  };

  return (
    <WhopUserContext.Provider value={value}>
      {children}
    </WhopUserContext.Provider>
  );
}

export function useWhopUser() {
  const context = useContext(WhopUserContext);
  if (context === undefined) {
    throw new Error("useWhopUser must be used within a WhopUserProvider");
  }
  return context;
}

// Hook for checking user permissions
export function useWhopPermissions() {
  const { user } = useWhopUser();

  const hasFeature = (feature: string): boolean => {
    if (!user) return false;

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

    return planFeatures[user.plan as PlanType]?.includes(feature) || false;
  };

  const getUsageLimits = () => {
    if (!user) return { monitors: 0, alerts: 0, notifications: 0 };

    const planLimits = {
      [PlanType.FREE]: { monitors: 5, alerts: 1, notifications: 100 },
      [PlanType.STARTER]: { monitors: 25, alerts: 5, notifications: 500 },
      [PlanType.PROFESSIONAL]: {
        monitors: 100,
        alerts: 25,
        notifications: 2000,
      },
      [PlanType.ENTERPRISE]: { monitors: -1, alerts: -1, notifications: -1 }, // unlimited
    };

    return planLimits[user.plan as PlanType];
  };

  const canCreateMonitor = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(
        `/api/auth/check-limit?action=create_monitor&userId=${user.id}`,
      );
      const data = await response.json();
      return data.allowed;
    } catch (error) {
      console.error("Error checking monitor limit:", error);
      return false;
    }
  };

  const canCreateAlert = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(
        `/api/auth/check-limit?action=create_alert&userId=${user.id}`,
      );
      const data = await response.json();
      return data.allowed;
    } catch (error) {
      console.error("Error checking alert limit:", error);
      return false;
    }
  };

  return {
    hasFeature,
    getUsageLimits,
    canCreateMonitor,
    canCreateAlert,
    isAdmin: user?.accessLevel === "admin",
    isCustomer: user?.accessLevel === "customer",
  };
}

// Hook for authentication state
export function useWhopAuth() {
  const { user, loading, error, isAuthenticated, refreshUser, logout } =
    useWhopUser();

  return {
    user,
    loading,
    error,
    isAuthenticated,
    refreshUser,
    logout,
  };
}

// Hook for billing operations
export function useWhopBilling() {
  const { user, updateUserPlan } = useWhopUser();

  const createCheckoutSession = async (planType: PlanType) => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch("/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const data = await response.json();
    return data.checkoutUrl;
  };

  const cancelSubscription = async () => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch("/api/billing/cancel", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to cancel subscription");
    }

    await updateUserPlan(PlanType.FREE);
  };

  return {
    createCheckoutSession,
    cancelSubscription,
    currentPlan: user?.plan || PlanType.FREE,
  };
}

// Component for protecting routes
interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireAuth({
  children,
  fallback,
  redirectTo = "/auth/login",
}: RequireAuthProps) {
  const { isAuthenticated, loading } = useWhopAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }

    return null;
  }

  return <>{children}</>;
}

// Component for protecting features based on plan
interface RequirePlanProps {
  children: ReactNode;
  plan: PlanType;
  feature?: string;
  fallback?: ReactNode;
}

export function RequirePlan({
  children,
  plan,
  feature,
  fallback,
}: RequirePlanProps) {
  const { user } = useWhopUser();
  const { hasFeature } = useWhopPermissions();

  if (!user) {
    return fallback || <div>Please log in to access this feature</div>;
  }

  // Check if user has required plan level
  const planLevels = {
    [PlanType.FREE]: 0,
    [PlanType.STARTER]: 1,
    [PlanType.PROFESSIONAL]: 2,
    [PlanType.ENTERPRISE]: 3,
  };

  const userPlanLevel = planLevels[user.plan as PlanType];
  const requiredPlanLevel = planLevels[plan];

  if (userPlanLevel < requiredPlanLevel) {
    return fallback || <div>This feature requires a higher plan</div>;
  }

  // Check specific feature if provided
  if (feature && !hasFeature(feature)) {
    return fallback || <div>This feature is not available in your plan</div>;
  }

  return <>{children}</>;
}
