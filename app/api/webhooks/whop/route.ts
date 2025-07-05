import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PlanType } from '@prisma/client';
import { syncUserPlan } from '@/lib/auth/whop-auth-middleware';

// Webhook event types we care about
interface WhopWebhookEvent {
  type: string;
  data: {
    id: string;
    user_id: string;
    product_id: string;
    status: string;
    metadata?: Record<string, string>;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (implement based on Whop's webhook security)
    const signature = request.headers.get('whop-signature');
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
    
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Verify signature properly
    // const isValid = verifyWebhookSignature(await request.text(), signature, webhookSecret);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    const event: WhopWebhookEvent = await request.json();
    
    // Handle subscription events
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionUpdate(event);
        break;
        
      case 'subscription.cancelled':
      case 'subscription.deleted':
        await handleSubscriptionCancellation(event);
        break;
        
      case 'payment.completed':
        await handlePaymentCompleted(event);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(event: WhopWebhookEvent) {
  try {
    const { user_id, product_id, status } = event.data;
    
    // Find user by Whop ID
    const user = await db.user.findUnique({
      where: { whopId: user_id },
    });
    
    if (!user) {
      console.warn(`User not found for Whop ID: ${user_id}`);
      return;
    }
    
    // Map product ID to plan type
    const planType = mapProductIdToPlan(product_id);
    
    if (!planType) {
      console.warn(`Unknown product ID: ${product_id}`);
      return;
    }
    
    // Update user plan if subscription is active
    if (status === 'active') {
      await db.user.update({
        where: { id: user.id },
        data: { plan: planType },
      });
      
      console.log(`Updated user ${user.id} to plan ${planType}`);
    }
    
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancellation(event: WhopWebhookEvent) {
  try {
    const { user_id } = event.data;
    
    // Find user by Whop ID
    const user = await db.user.findUnique({
      where: { whopId: user_id },
    });
    
    if (!user) {
      console.warn(`User not found for Whop ID: ${user_id}`);
      return;
    }
    
    // Downgrade user to FREE plan
    await db.user.update({
      where: { id: user.id },
      data: { plan: PlanType.FREE },
    });
    
    console.log(`Downgraded user ${user.id} to FREE plan`);
    
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentCompleted(event: WhopWebhookEvent) {
  try {
    const { user_id, product_id } = event.data;
    
    // Find user by Whop ID
    const user = await db.user.findUnique({
      where: { whopId: user_id },
    });
    
    if (!user) {
      console.warn(`User not found for Whop ID: ${user_id}`);
      return;
    }
    
    // Map product ID to plan type and update user
    const planType = mapProductIdToPlan(product_id);
    
    if (planType) {
      await db.user.update({
        where: { id: user.id },
        data: { plan: planType },
      });
      
      console.log(`Payment completed: Updated user ${user.id} to plan ${planType}`);
    }
    
  } catch (error) {
    console.error('Error handling payment completion:', error);
  }
}

function mapProductIdToPlan(productId: string): PlanType | null {
  const productIdMappings: Record<string, PlanType> = {
    [process.env.WHOP_STARTER_PRODUCT_ID || '']: PlanType.STARTER,
    [process.env.WHOP_PROFESSIONAL_PRODUCT_ID || '']: PlanType.PROFESSIONAL,
    [process.env.WHOP_ENTERPRISE_PRODUCT_ID || '']: PlanType.ENTERPRISE,
  };
  
  return productIdMappings[productId] || null;
} 