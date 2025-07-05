import { Metadata } from "next";
import { requireWhopAuthForPage } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";
import BillingClient from "@/components/billing/BillingClient";

export const metadata: Metadata = {
  title: "Billing & Subscription - WatchTower Pro",
  description: "Manage your WatchTower Pro subscription and billing",
};

export default async function BillingPage() {
  // Authenticate user
  const result = await requireWhopAuthForPage();
  
  if ("redirect" in result) {
    redirect(result.redirect);
  }

  const { user } = result;

  return (
    <BillingClient
      user={{
        id: user.id,
        plan: user.plan,
        email: user.email,
      }}
    />
  );
}
