"use client";

import MonitorCreator from "@/components/monitors/MonitorCreator";
import { RequireAuth, useWhopUser } from "@/lib/context/WhopUserContext";
import { useRouter } from "next/navigation";

export default function CreateMonitorPage() {
  const { user } = useWhopUser();
  const router = useRouter();

  const handleMonitorCreated = (monitor: any) => {
    // Redirect to dashboard after successful creation
    router.push("/dashboard");
  };

  const handleCancel = () => {
    // Redirect back to dashboard
    router.push("/dashboard");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create Monitor</h1>
                  <p className="mt-2 text-gray-600">Set up monitoring for your websites and services</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MonitorCreator
            userId={user.id}
            userPlan={user.plan}
            onMonitorCreated={handleMonitorCreated}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </RequireAuth>
  );
} 