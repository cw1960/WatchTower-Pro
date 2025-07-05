import { requireWhopAuthForPage } from "@/lib/auth/whop-auth-middleware";
import { redirect } from "next/navigation";
import MonitorCreator from "@/components/monitors/MonitorCreator";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default async function CreateMonitorPage() {
  const result = await requireWhopAuthForPage();

  if ("redirect" in result) {
    redirect(result.redirect);
  }

  const { user } = result;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Monitor</h1>
            <p className="text-gray-600 mt-2">
              Set up monitoring for your websites and services
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl">
          <MonitorCreator
            userId={user.id}
            userPlan={user.plan}
            onMonitorCreated={() => {
              // Handle monitor creation - could redirect to dashboard or show success message
              window.location.href = "/dashboard";
            }}
          />
        </div>
      </div>
    </div>
  );
}
