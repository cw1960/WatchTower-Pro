"use client";

import MonitorCreator from "@/components/monitors/MonitorCreator";
import { PlanType } from "@prisma/client";

interface MonitorCreatorWrapperProps {
  userId: string;
  userPlan: PlanType;
}

export default function MonitorCreatorWrapper({
  userId,
  userPlan,
}: MonitorCreatorWrapperProps) {
  const handleMonitorCreated = () => {
    // Handle monitor creation - redirect to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <MonitorCreator
      userId={userId}
      userPlan={userPlan}
      onMonitorCreated={handleMonitorCreated}
    />
  );
}
