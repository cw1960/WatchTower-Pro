import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWhopUser, logoutUser } from '@/lib/auth/whop-auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentWhopUser();
    
    if (user) {
      await logoutUser(user.id);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 