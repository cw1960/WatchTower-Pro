import { Metadata } from 'next';
import { requireWhopAuthForPage } from '@/lib/auth/whop-auth-middleware';
import { db } from '@/lib/db';
import AlertManager from '@/components/alerts/AlertManager';
import { RequireAuth } from '@/lib/context/WhopUserContext';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Alert Management - WatchTower Pro',
  description: 'Manage your monitoring alerts and notification preferences',
};

export default async function AlertsPage() {
  try {
    const authResult = await requireWhopAuthForPage();
    
    if ('redirect' in authResult) {
      redirect(authResult.redirect);
    }
    
    const { user } = authResult;

    // Get user's monitors
    const monitors = await db.monitor.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <AlertManager 
              userId={user.id}
              monitors={monitors}
              userPlan={user.plan}
            />
          </div>
        </div>
      </RequireAuth>
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