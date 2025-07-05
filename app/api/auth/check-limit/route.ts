import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWhopUser, checkUsageLimit } from '@/lib/auth/whop-auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') as 'create_monitor' | 'create_alert' | 'send_notification';
    
    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }
    
    const user = await getCurrentWhopUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const limitCheck = await checkUsageLimit(user, action);
    
    return NextResponse.json(limitCheck);
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 