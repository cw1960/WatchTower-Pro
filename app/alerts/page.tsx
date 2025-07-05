import { Metadata } from 'next';
import { whopAuth } from '@/lib/whop-sdk';
import { db } from '@/lib/db';
import AlertManager from '@/components/alerts/AlertManager';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Alert Management - WatchTower Pro',
  description: 'Manage your monitoring alerts and notification preferences',
};

export default async function AlertsPage() {
  try {
    // Get the current user
    const currentUser = await whopAuth.getCurrentUser();
    
    if (!currentUser) {
      redirect('/auth/login');
    }

    // Get user's monitors
    const monitors = await db.monitor.findMany({
      where: { userId: currentUser.id },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get user's plan type (default to FREE if not set)
    const userPlan = (currentUser.plan as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') || 'FREE';

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AlertManager 
            userId={currentUser.id}
            monitors={monitors}
            userPlan={userPlan}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading alerts page:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load alerts</h1>
          <p className="text-gray-600 mb-4">There was an error loading your alerts. Please try again.</p>
          <a
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
} 