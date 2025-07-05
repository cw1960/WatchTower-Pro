import { NextRequest, NextResponse } from "next/server";
import { getCurrentWhopUser } from "@/lib/auth/whop-auth-middleware";
import { whopPricing, PlanType } from "@/lib/whop-sdk";
import { z } from "zod";

const createCheckoutSchema = z.object({
  planType: z.nativeEnum(PlanType),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentWhopUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { planType, successUrl, cancelUrl } =
      createCheckoutSchema.parse(body);

    // Check if user is trying to downgrade (not allowed)
    const planLevels = {
      [PlanType.FREE]: 0,
      [PlanType.STARTER]: 1,
      [PlanType.PROFESSIONAL]: 2,
      [PlanType.ENTERPRISE]: 3,
    };

    const currentLevel = planLevels[user.plan];
    const targetLevel = planLevels[planType];

    if (targetLevel <= currentLevel) {
      return NextResponse.json(
        {
          error:
            "Cannot downgrade plan through checkout. Please contact support.",
        },
        { status: 400 },
      );
    }

    // Create checkout session
    const defaultSuccessUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing/success`;
    const defaultCancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing`;

    const checkoutSession = await whopPricing.createCheckoutSession({
      userId: user.id,
      planType,
      productId: null, // Will be determined by plan type
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
      metadata: {
        userId: user.id,
        currentPlan: user.plan,
        targetPlan: planType,
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
