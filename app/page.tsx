export default function Page() {
  return (
    <div className="min-h-screen iframe-background py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#0f172a" }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            🗼 WatchTower Pro
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Advanced website monitoring and alert platform for Whop creators.
            Monitor your websites, track Whop metrics, and get intelligent
            alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="whop-gradient-border bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl hover:scale-105 transition-all duration-300 iframe-safe">
            <div className="p-6 h-full" style={{ backgroundColor: "#0f172a" }}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Website Monitoring
              </h3>
              <p className="text-cyan-200 text-sm">
                Monitor HTTP/HTTPS endpoints, ping servers, and check TCP ports
                with customizable intervals and alerts.
              </p>
            </div>
          </div>

          <div className="whop-gradient-border bg-gradient-to-br from-green-500 to-emerald-500 shadow-xl hover:scale-105 transition-all duration-300 iframe-safe">
            <div className="p-6 h-full" style={{ backgroundColor: "#0f172a" }}>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Whop Metrics
              </h3>
              <p className="text-emerald-200 text-sm">
                Track your Whop business metrics including sales, user growth,
                revenue, and get alerts on anomalies.
              </p>
            </div>
          </div>

          <div className="whop-gradient-border bg-gradient-to-br from-yellow-500 to-orange-500 shadow-xl hover:scale-105 transition-all duration-300 iframe-safe">
            <div className="p-6 h-full" style={{ backgroundColor: "#0f172a" }}>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Smart Alerts
              </h3>
              <p className="text-orange-200 text-sm">
                Get notified via email, Slack, Discord, or SMS when issues are
                detected with intelligent escalation.
              </p>
            </div>
          </div>

          <div className="whop-gradient-border bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl hover:scale-105 transition-all duration-300 iframe-safe">
            <div className="p-6 h-full" style={{ backgroundColor: "#0f172a" }}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                SSL Monitoring
              </h3>
              <p className="text-pink-200 text-sm">
                Monitor SSL certificates and get warned before they expire to
                avoid downtime.
              </p>
            </div>
          </div>

          <div className="whop-gradient-border bg-gradient-to-br from-red-500 to-pink-500 shadow-xl hover:scale-105 transition-all duration-300 iframe-safe">
            <div className="p-6 h-full" style={{ backgroundColor: "#0f172a" }}>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Performance Tracking
              </h3>
              <p className="text-pink-200 text-sm">
                Track response times, uptime statistics, and performance trends
                over time.
              </p>
            </div>
          </div>

          <div className="whop-gradient-border bg-gradient-to-br from-indigo-500 to-blue-500 shadow-xl hover:scale-105 transition-all duration-300 iframe-safe">
            <div className="p-6 h-full" style={{ backgroundColor: "#0f172a" }}>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Team Collaboration
              </h3>
              <p className="text-blue-200 text-sm">
                Share monitors and alerts with your team, manage incidents, and
                coordinate responses.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="whop-gradient-border bg-gradient-to-r from-slate-600 to-blue-600 shadow-2xl iframe-safe">
            <div className="p-8" style={{ backgroundColor: "#0f172a" }}>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white mr-3 text-sm font-bold shadow-lg">
                  1
                </span>
                Project Setup Complete
              </h2>
              <div className="ml-11">
                <p className="text-slate-300 mb-4">
                  The WatchTower Pro foundation has been successfully set up with:
                </p>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    Complete database schema with Prisma
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    Authentication & authorization system
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    Professional monitoring engine
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    Beautiful, responsive UI components
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    Whop integration and billing system
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
