import { getMonitoringEngine } from "@/lib/monitoring/init";

// Example 1: Price Change Detection on E-commerce Site
export async function setupPriceMonitoring() {
  console.log("🛒 Setting up price monitoring example...");

  const examplePriceMonitor = {
    userId: "user_123",
    companyId: "company_123",
    name: "Amazon Product Price Monitor",
    url: "https://amazon.com/dp/B08N5WRWNW",
    type: "HTTP" as const,
    interval: 600, // 10 minutes (Basic plan)
    timeout: 30,
    retries: 3,
    method: "GET",
    expectedStatus: 200,
    // Custom selectors for price extraction
    whopMetrics: {
      priceSelectors: [
        ".a-price-whole",
        "#priceblock_dealprice",
        ".a-price .a-offscreen",
      ],
      extractPrices: true,
      customSelectors: {
        title: "span#productTitle",
        availability: ".a-color-success, .a-color-error",
        reviews: '[data-hook="total-review-count"]',
      },
    },
  };

  console.log("✅ Price monitoring setup complete!");
  console.log("   • Monitors product prices every 10 minutes");
  console.log("   • Detects price changes with threshold alerts");
  console.log("   • Tracks availability and review changes");

  return examplePriceMonitor;
}

// Example 2: Campaign Metrics Monitoring (CPM Tracking)
export async function setupCampaignMonitoring() {
  console.log("📊 Setting up campaign monitoring example...");

  const exampleCampaignMonitor = {
    userId: "user_123",
    companyId: "company_123",
    name: "Facebook Ads CPM Monitor",
    url: "https://business.facebook.com/adsmanager",
    type: "HTTP" as const,
    interval: 300, // 5 minutes (Pro plan)
    timeout: 45,
    retries: 3,
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    whopMetrics: {
      extractMetrics: true,
      metricSelectors: [
        {
          name: "cpm",
          selector: '[data-testid="cpm-metric"]',
          type: "number",
        },
        {
          name: "impressions",
          selector: '[data-testid="impressions-metric"]',
          type: "number",
        },
        {
          name: "clicks",
          selector: '[data-testid="clicks-metric"]',
          type: "number",
        },
      ],
      customSelectors: {
        campaign_status: '[data-testid="campaign-status"]',
        daily_budget: '[data-testid="daily-budget"]',
        conversion_rate: '[data-testid="conversion-rate"]',
      },
    },
  };

  console.log("✅ Campaign monitoring setup complete!");
  console.log("   • Monitors CPM, impressions, and clicks");
  console.log("   • Tracks campaign performance metrics");
  console.log("   • Alerts on significant metric changes");

  return exampleCampaignMonitor;
}

// Example 3: Website Availability Monitoring
export async function setupAvailabilityMonitoring() {
  console.log("🌐 Setting up availability monitoring example...");

  const exampleAvailabilityMonitor = {
    userId: "user_123",
    companyId: "company_123",
    name: "Website Uptime Monitor",
    url: "https://example.com",
    type: "HTTPS" as const,
    interval: 60, // 1 minute (Enterprise plan)
    timeout: 15,
    retries: 3,
    method: "GET",
    expectedStatus: 200,
    responseTimeThreshold: 3000,
    sslCheck: true,
    sslExpiryDays: 30,
    expectedContent: "Welcome to our website",
    expectedKeywords: ["online", "available", "service"],
    whopMetrics: {
      extractPerformance: true,
      extractSEO: true,
      customSelectors: {
        error_message: ".error-message, .maintenance-notice",
        login_form: 'form[action*="login"]',
        search_functionality: 'input[type="search"]',
      },
    },
  };

  console.log("✅ Availability monitoring setup complete!");
  console.log("   • Monitors website uptime and performance");
  console.log("   • SSL certificate expiry tracking");
  console.log("   • Response time and content validation");

  return exampleAvailabilityMonitor;
}

// Example 4: Content Change Detection
export async function setupContentMonitoring() {
  console.log("📝 Setting up content monitoring example...");

  const exampleContentMonitor = {
    userId: "user_123",
    companyId: "company_123",
    name: "Competitor News Monitor",
    url: "https://competitor.com/news",
    type: "HTTP" as const,
    interval: 1800, // 30 minutes (Basic plan)
    timeout: 30,
    retries: 3,
    method: "GET",
    expectedStatus: 200,
    whopMetrics: {
      extractSEO: true,
      customSelectors: {
        latest_article: "article:first-child h2",
        article_count: "article",
        featured_content: ".featured-news",
        press_releases: ".press-release-section",
      },
      actions: [
        {
          type: "wait",
          delay: 2000,
        },
        {
          type: "scroll",
          selector: ".news-container",
        },
      ],
    },
  };

  console.log("✅ Content monitoring setup complete!");
  console.log("   • Monitors competitor news and updates");
  console.log("   • Detects new articles and content changes");
  console.log("   • Tracks SEO changes and keyword usage");

  return exampleContentMonitor;
}

// Example 5: Whop-Specific Business Metrics
export async function setupWhopMetricsMonitoring() {
  console.log("💰 Setting up Whop metrics monitoring example...");

  const exampleWhopMonitor = {
    userId: "user_123",
    companyId: "company_123",
    name: "Whop Business Metrics Monitor",
    url: "https://whop.com/hub/metrics",
    type: "WHOP_METRICS" as const,
    interval: 300, // 5 minutes (Pro plan)
    timeout: 30,
    retries: 3,
    whopMetrics: {
      trackSales: true,
      trackUsers: true,
      trackRevenue: true,
      trackSubscriptions: true,
      extractMetrics: true,
      metricSelectors: [
        {
          name: "total_revenue",
          selector: '[data-metric="total-revenue"]',
          type: "number",
        },
        {
          name: "active_users",
          selector: '[data-metric="active-users"]',
          type: "number",
        },
        {
          name: "conversion_rate",
          selector: '[data-metric="conversion-rate"]',
          type: "number",
        },
      ],
      whopThresholds: {
        revenue_drop: 0.1, // 10% drop threshold
        user_spike: 0.25, // 25% spike threshold
        conversion_drop: 0.15, // 15% drop threshold
      },
    },
  };

  console.log("✅ Whop metrics monitoring setup complete!");
  console.log("   • Monitors business KPIs and revenue");
  console.log("   • Tracks user acquisition and conversion");
  console.log("   • Alerts on significant metric changes");

  return exampleWhopMonitor;
}

// Example 6: Manual Monitor Execution
export async function runManualMonitorTest() {
  console.log("🔍 Running manual monitor test...");

  try {
    const engine = getMonitoringEngine();

    // Example: Run a monitor manually
    const monitorId = "monitor_123";
    const result = await engine.runMonitorNow(monitorId);

    console.log("✅ Manual monitor execution completed!");
    console.log(`   • Success: ${result.success}`);
    console.log(`   • Execution Time: ${result.executionTime}ms`);
    console.log(
      `   • Alerts Triggered: ${result.alertsTriggered?.length || 0}`,
    );

    if (result.scrapeResult) {
      console.log(`   • Response Time: ${result.scrapeResult.responseTime}ms`);
      console.log(
        `   • Status Code: ${result.scrapeResult.data?.statusCode || "N/A"}`,
      );
    }

    return result;
  } catch (error) {
    console.error("❌ Manual monitor test failed:", error);
    throw error;
  }
}

// Example 7: Get Monitoring System Stats
export async function getMonitoringStats() {
  console.log("📊 Getting monitoring system statistics...");

  try {
    const engine = getMonitoringEngine();
    const stats = engine.getStats();
    const schedulerMetrics = engine.getSchedulerMetrics();

    console.log("✅ Monitoring Statistics:");
    console.log(`   • Total Monitors: ${stats.totalMonitors}`);
    console.log(`   • Active Monitors: ${stats.activeMonitors}`);
    console.log(`   • Total Checks: ${stats.totalChecks}`);
    console.log(
      `   • Success Rate: ${((stats.successfulChecks / stats.totalChecks) * 100).toFixed(1)}%`,
    );
    console.log(`   • Average Response Time: ${stats.averageResponseTime}ms`);
    console.log(`   • Alerts Triggered: ${stats.alertsTriggered}`);

    console.log("\n📈 Scheduler Metrics:");
    console.log(`   • Running Jobs: ${schedulerMetrics.runningJobs}`);
    console.log(`   • Completed Jobs: ${schedulerMetrics.completedJobs}`);
    console.log(`   • Failed Jobs: ${schedulerMetrics.failedJobs}`);
    console.log(
      `   • Success Rate: ${(schedulerMetrics.successRate * 100).toFixed(1)}%`,
    );

    return { stats, schedulerMetrics };
  } catch (error) {
    console.error("❌ Failed to get monitoring stats:", error);
    throw error;
  }
}

// Main demo function
export async function runMonitoringDemo() {
  console.log("🚀 WatchTower Pro Monitoring Demo\n");

  // Setup all example monitors
  const monitors = [
    await setupPriceMonitoring(),
    await setupCampaignMonitoring(),
    await setupAvailabilityMonitoring(),
    await setupContentMonitoring(),
    await setupWhopMetricsMonitoring(),
  ];

  console.log(`\n📋 Created ${monitors.length} example monitors`);
  console.log("💡 Use these as templates for your own monitoring needs!");

  // Show stats
  console.log("\n");
  await getMonitoringStats();

  return monitors;
}
