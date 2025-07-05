import { Metadata } from "next";
import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";
import BillingClient from "@/components/billing/BillingClient";
import { PlanType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Billing & Subscription - WatchTower Pro",
  description: "Manage your WatchTower Pro subscription and billing",
};

export default async function BillingPage() {
  try {
    console.log("🔍 BillingPage: Starting authentication");
    
    const authResult = await validateWhopAuth();

    if (!authResult.success || !authResult.user) {
      console.error("❌ BillingPage: Authentication failed:", authResult.error);
      redirect("/");
    }

    const user = authResult.user;
    console.log("✅ BillingPage: User authenticated:", { userId: user.id, name: user.name });

    // Cast the plan string to PlanType enum
    const userPlan = user.plan as PlanType;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <BillingClient
          user={{
            id: user.id,
            plan: userPlan,
            email: user.email,
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("❌ BillingPage: Error:", error);
    redirect("/");
  }
}
