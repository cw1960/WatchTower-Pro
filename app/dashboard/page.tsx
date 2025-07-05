import Dashboard from "@/components/dashboard/Dashboard";
import { RequireAuth } from "@/lib/context/WhopUserContext";
import { requireWhopAuthForPage } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const authResult = await requireWhopAuthForPage();
  
  if ('redirect' in authResult) {
    redirect(authResult.redirect);
  }
  
  const { user } = authResult;

  return (
    <RequireAuth>
      <Dashboard userId={user.id} userPlan={user.plan} />
    </RequireAuth>
  );
}
