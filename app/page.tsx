export default function Page() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-6xl font-bold text-gradient mb-6">
            🗼 WatchTower Pro
          </h1>
          <p className="text-xl sm:text-xl max-w-2xl mx-auto">
            Advanced website monitoring and alert platform for Whop creators.
            Monitor your websites, track Whop metrics, and get intelligent
            alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard Card */}
          <div className="gradient-border">
            <div className="gradient-border-content">
              <div className="icon icon-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="card-title">Dashboard</h3>
              <p className="card-text">
                Real-time monitoring dashboard with comprehensive analytics and
                system overview.
              </p>
            </div>
          </div>

          {/* Monitoring Card */}
          <div className="gradient-border">
            <div className="gradient-border-content">
              <div className="icon icon-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="card-title">Add Monitor</h3>
              <p className="card-text">
                Set up new website monitors with custom intervals and
                conditions.
              </p>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="gradient-border">
            <div className="gradient-border-content">
              <div className="icon icon-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6l2 2-2 2H9V7z" />
                </svg>
              </div>
              <h3 className="card-title">Alerts</h3>
              <p className="card-text">
                Manage notification preferences and alert configurations.
              </p>
            </div>
          </div>

          {/* Whop Integration Card */}
          <div className="gradient-border">
            <div className="gradient-border-content">
              <div className="icon icon-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="card-title">Whop Integration</h3>
              <p className="card-text">
                Monitor Whop-specific metrics and integrate with your business
                data.
              </p>
            </div>
          </div>

          {/* Analytics Card */}
          <div className="gradient-border">
            <div className="gradient-border-content">
              <div className="icon icon-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="card-title">Analytics</h3>
              <p className="card-text">
                Detailed performance analytics and historical data insights.
              </p>
            </div>
          </div>

          {/* Settings Card */}
          <div className="gradient-border">
            <div className="gradient-border-content">
              <div className="icon icon-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="card-title">Settings</h3>
              <p className="card-text">
                Configure account preferences, API keys, and system settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
