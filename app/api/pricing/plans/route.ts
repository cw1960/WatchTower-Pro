import { NextRequest, NextResponse } from "next/server";
import PricingService from "@/lib/pricing";

// GET /api/pricing/plans - Get all pricing plans
export async function GET(request: NextRequest) {
  try {
    const plans = PricingService.getPlanComparison();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/pricing/usage - Get usage and upgrade suggestions for a user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const usage = await PricingService.getUserUsage(userId);
    const user = await require("@/lib/db").db.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const planType = user.plan;
    const suggestions = PricingService.getUpgradeSuggestions(planType, usage);
    const planConfig = PricingService.getPlanConfig(planType);

    return NextResponse.json({
      usage,
      plan: {
        type: planType,
        config: planConfig,
      },
      suggestions,
    });
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
