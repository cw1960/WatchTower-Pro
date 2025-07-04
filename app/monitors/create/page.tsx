export default function CreateMonitorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Monitor</h1>
                <p className="mt-2 text-gray-600">Set up monitoring for your websites and services</p>
              </div>
              <div className="flex items-center space-x-4">
                                 <a href="/dashboard" className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 inline-block">
                   Back to Dashboard
                 </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <form className="space-y-6">
              {/* Monitor Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Monitor Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      name="monitorType"
                      value="HTTP"
                      className="sr-only"
                      defaultChecked
                    />
                    <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">HTTP/HTTPS</h3>
                      <p className="text-xs text-gray-500 mt-1">Monitor website uptime and response times</p>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="monitorType"
                      value="PING"
                      className="sr-only"
                    />
                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Ping</h3>
                      <p className="text-xs text-gray-500 mt-1">Check if a server is reachable</p>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="monitorType"
                      value="PORT"
                      className="sr-only"
                    />
                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">Port</h3>
                      <p className="text-xs text-gray-500 mt-1">Monitor TCP/UDP ports</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Monitor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monitor Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="My Website Monitor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL or IP
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Monitoring Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check Interval
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                    <option value="900">15 minutes</option>
                    <option value="3600">1 hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="30"
                  />
                </div>
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Options</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Status Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Response Content
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Expected text in response (optional)"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Follow redirects
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Ignore SSL errors
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Alert Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alert When
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                      <option value="DOWN">Monitor goes down</option>
                      <option value="SLOW">Response time is slow</option>
                      <option value="BOTH">Both down and slow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Methods
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <span className="ml-2 text-sm text-gray-700">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Slack</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Discord</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create Monitor
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Pro Features Notice */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Pro Features Available</h3>
              <p className="text-sm text-gray-600 mt-1">
                Advanced monitoring features including SSL monitoring, content change detection, API monitoring, and Whop business metrics integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 