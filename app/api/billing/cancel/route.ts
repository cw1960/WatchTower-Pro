import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWhopUser } from '@/lib/auth/whop-auth-middleware';
import { whopPricing, PlanType } from '@/lib/whop-sdk';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentWhopUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Only allow cancellation if user has a paid plan
    if (user.plan === PlanType.FREE) {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 400 }
      );
    }
    
    // Cancel subscription using Whop SDK
    const cancellationResult = await whopPricing.cancelSubscription(user.id);
    
    if (!cancellationResult.success) {
      return NextResponse.json(
        { error: cancellationResult.message || 'Failed to cancel subscription' },
        { status: 500 }
      );
    }
    
    // Update user plan to FREE in database
    await db.user.update({
      where: { id: user.id },
      data: { plan: PlanType.FREE },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully. You will continue to have access until the end of your current billing period.',
    });
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 