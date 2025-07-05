import Dashboard from "@/components/dashboard/Dashboard";
import { validateWhopAuth } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";
import { PlanType } from "@prisma/client";

export default async function DashboardPage() {
  try {
    console.log("🔍 DashboardPage: Starting authentication");
    
    const authResult = await validateWhopAuth();

    if (!authResult.success || !authResult.user) {
      console.error("❌ DashboardPage: Authentication failed:", authResult.error);
      redirect("/");
    }

    const user = authResult.user;
    console.log("✅ DashboardPage: User authenticated:", { userId: user.id, name: user.name });

    // Cast the plan string to PlanType enum
    const userPlan = user.plan as PlanType;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Dashboard userId={user.id} userPlan={userPlan} />
      </div>
    );
  } catch (error) {
    console.error("❌ DashboardPage: Error:", error);
    redirect("/");
  }
}
