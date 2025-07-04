import Dashboard from "@/components/dashboard/Dashboard";
import { PlanType } from "@/lib/whop-sdk";

export default function DashboardPage() {
  // In a real Whop app, you would get this from the Whop SDK
  // For now, using the first user from our seed data
  const userId = "cmcpgepgp00007cwfw7frnuhb"; // This would come from Whop auth
  const userPlan = PlanType.PROFESSIONAL;

  return (
    <Dashboard userId={userId} userPlan={userPlan} />
  );
}
