export default function Page() {
	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-6xl font-bold text-gray-900 mb-4">
						WatchTower Pro
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Advanced website monitoring and alert platform for Whop creators. Monitor your websites, track Whop metrics, and get intelligent alerts.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Website Monitoring</h3>
						<p className="text-gray-600">Monitor HTTP/HTTPS endpoints, ping servers, and check TCP ports with customizable intervals and alerts.</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Whop Metrics</h3>
						<p className="text-gray-600">Track your Whop business metrics including sales, user growth, revenue, and get alerts on anomalies.</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Alerts</h3>
						<p className="text-gray-600">Get notified via email, Slack, Discord, or SMS when issues are detected with intelligent escalation.</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">SSL Monitoring</h3>
						<p className="text-gray-600">Monitor SSL certificates and get warned before they expire to avoid downtime.</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Tracking</h3>
						<p className="text-gray-600">Track response times, uptime statistics, and performance trends over time.</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h3>
						<p className="text-gray-600">Share monitors and alerts with your team, manage incidents, and coordinate responses.</p>
					</div>
				</div>

				<div className="space-y-8">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3 text-sm font-bold">
								1
							</span>
							Project Setup Complete
						</h2>
						<div className="ml-11">
							<p className="text-gray-600 mb-4">
								The WatchTower Pro foundation has been successfully set up with:
							</p>
							<ul className="space-y-2 text-gray-600">
								<li className="flex items-center">
									<svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									Complete database schema with Prisma
								</li>
								<li className="flex items-center">
									<svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									Whop SDK integration with authentication
								</li>
								<li className="flex items-center">
									<svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									API routes for monitors, alerts, billing, and users
								</li>
								<li className="flex items-center">
									<svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									React components for Dashboard and MonitorCreator
								</li>
								<li className="flex items-center">
									<svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									Environment configuration and dependencies
								</li>
							</ul>
						</div>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mr-3 text-sm font-bold">
								2
							</span>
							Next Steps
						</h2>
						<div className="ml-11">
							<p className="text-gray-600 mb-4">
								To complete the setup and start using WatchTower Pro:
							</p>
							<ol className="space-y-3 text-gray-600">
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
										1
									</span>
									<div>
										<strong>Configure Environment:</strong> Copy <code className="bg-gray-100 px-1 rounded">env.example</code> to <code className="bg-gray-100 px-1 rounded">.env</code> and fill in your actual values
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
										2
									</span>
									<div>
										<strong>Set up Database:</strong> Run <code className="bg-gray-100 px-1 rounded">npm run db:push</code> to create the database schema
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
										3
									</span>
									<div>
										<strong>Install Whop App:</strong> {process.env.NEXT_PUBLIC_WHOP_APP_ID ? (
											<a
												href={`https://whop.com/apps/${process.env.NEXT_PUBLIC_WHOP_APP_ID}/install`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:text-blue-700 underline"
											>
												Install your Whop app
											</a>
										) : (
											<span>Configure your Whop app credentials first</span>
										)}
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
										4
									</span>
									<div>
										<strong>Start Development:</strong> Run <code className="bg-gray-100 px-1 rounded">npm run dev</code> to start the development server
									</div>
								</li>
							</ol>
						</div>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
							<span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-3 text-sm font-bold">
								3
							</span>
							Development Status
						</h2>
						<div className="ml-11">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="font-medium text-gray-900 mb-2">✅ Completed</h4>
									<ul className="space-y-1 text-sm text-gray-600">
										<li>• Next.js project setup</li>
										<li>• Database schema design</li>
										<li>• Whop SDK integration</li>
										<li>• API routes structure</li>
										<li>• Basic UI components</li>
										<li>• Environment configuration</li>
									</ul>
								</div>
								<div>
									<h4 className="font-medium text-gray-900 mb-2">🚧 Next Phase</h4>
									<ul className="space-y-1 text-sm text-gray-600">
										<li>• Monitoring engine</li>
										<li>• Notification system</li>
										<li>• Whop metrics integration</li>
										<li>• Advanced UI components</li>
										<li>• Testing & optimization</li>
										<li>• Deployment setup</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-12 text-center text-sm text-gray-500">
					<p>
						Built with Next.js, Prisma, TypeScript, and Whop SDK. Ready for{" "}
						<a
							href="https://dev.whop.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:text-blue-700 underline"
						>
							Whop Platform
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
