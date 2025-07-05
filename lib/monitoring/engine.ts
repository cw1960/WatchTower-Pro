import { Monitor, MonitorCheck, Alert, User, Company } from "@prisma/client";
import { db } from "@/lib/db";
import WebScraper, {
  ScrapeOptions,
  ScrapeResult,
  ScrapingPresets,
} from "./scraper";
import ConditionEvaluator, {
  Condition,
  ConditionGroup,
  ConditionEvaluationContext,
  EvaluationResult,
  GroupEvaluationResult,
  ConditionTemplates,
} from "./conditions";
import { getScheduler, MonitorScheduler, SchedulerConfig } from "./scheduler";
import WhopMetricsCollector, {
  WhopMetricsConfig,
  WhopMetricsResult,
  WhopMonitoringUtils,
} from "./whop-collector";

export interface MonitoringEngineConfig {
  scheduler?: Partial<SchedulerConfig>;
  defaultTimeout?: number;
  maxConcurrentMonitors?: number;
  enableAutoScaling?: boolean;
  retryFailedChecks?: boolean;
  alertIntegrations?: AlertIntegration[];
  enableMetrics?: boolean;
  enableLogging?: boolean;
}

export interface AlertIntegration {
  type: "email" | "slack" | "webhook" | "sms";
  config: Record<string, any>;
  enabled: boolean;
}

export interface MonitoringResult {
  monitorId: string;
  success: boolean;
  scrapeResult?: ScrapeResult;
  evaluationResults?: EvaluationResult[];
  groupEvaluationResults?: GroupEvaluationResult[];
  alertsTriggered?: string[];
  checkId?: string;
  incidentIds?: string[];
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface MonitoringStats {
  totalMonitors: number;
  activeMonitors: number;
  failedMonitors: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  alertsTriggered: number;
  incidentsCreated: number;
  lastCheckTime?: Date;
}

export class MonitoringEngine {
  private scheduler: MonitorScheduler;
  private config: MonitoringEngineConfig;
  private isRunning: boolean = false;
  private stats: MonitoringStats;

  constructor(config: MonitoringEngineConfig = {}) {
    this.config = {
      defaultTimeout: 30000,
      maxConcurrentMonitors: 10,
      enableAutoScaling: false,
      retryFailedChecks: true,
      enableMetrics: true,
      enableLogging: true,
      ...config,
    };

    this.scheduler = getScheduler(this.config.scheduler);
    this.stats = {
      totalMonitors: 0,
      activeMonitors: 0,
      failedMonitors: 0,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTime: 0,
      alertsTriggered: 0,
      incidentsCreated: 0,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Monitoring engine is already running");
    }

    this.log("Starting monitoring engine...");
    this.isRunning = true;

    // Initialize stats
    await this.updateStats();

    // Start scheduler
    await this.scheduler.start();

    // Load and sync monitors
    await this.syncMonitors();

    this.log("Monitoring engine started successfully");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.log("Stopping monitoring engine...");
    this.isRunning = false;

    // Stop scheduler
    await this.scheduler.stop();

    this.log("Monitoring engine stopped");
  }

  async createMonitor(
    monitorData: Omit<Monitor, "id" | "createdAt" | "updatedAt" | "lastCheck">,
  ): Promise<Monitor> {
    try {
      // Create monitor in database with proper type handling
      const monitor = await db.monitor.create({
        data: {
          name: monitorData.name,
          type: monitorData.type,
          userId: monitorData.userId,
          companyId: monitorData.companyId,
          url: monitorData.url,
          interval: monitorData.interval,
          timeout: monitorData.timeout,
          retries: monitorData.retries,
          method: monitorData.method,
          headers: monitorData.headers as any,
          body: monitorData.body,
          expectedStatus: monitorData.expectedStatus,
          expectedContent: monitorData.expectedContent,
          expectedKeywords: monitorData.expectedKeywords,
          sslCheck: monitorData.sslCheck,
          sslExpiryDays: monitorData.sslExpiryDays,
          responseTimeThreshold: monitorData.responseTimeThreshold,
          whopMetrics: monitorData.whopMetrics as any,
          whopThresholds: monitorData.whopThresholds as any,
          status: "ACTIVE" as const,
        },
      });

      // Add to scheduler
      await this.scheduler.addMonitor(monitor);

      // Update stats
      await this.updateStats();

      this.log(`Created monitor: ${monitor.name} (${monitor.id})`);
      return monitor;
    } catch (error) {
      this.log(
        `Error creating monitor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async updateMonitor(
    monitorId: string,
    updateData: Partial<Monitor>,
  ): Promise<Monitor> {
    try {
      // Update monitor in database
      const monitor = await db.monitor.update({
        where: { id: monitorId },
        data: updateData,
      });

      // Update in scheduler
      await this.scheduler.updateMonitor(monitor);

      this.log(`Updated monitor: ${monitor.name} (${monitor.id})`);
      return monitor;
    } catch (error) {
      this.log(
        `Error updating monitor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async deleteMonitor(monitorId: string): Promise<void> {
    try {
      // Remove from scheduler first
      await this.scheduler.removeMonitor(monitorId);

      // Delete from database
      await db.monitor.delete({
        where: { id: monitorId },
      });

      // Update stats
      await this.updateStats();

      this.log(`Deleted monitor: ${monitorId}`);
    } catch (error) {
      this.log(
        `Error deleting monitor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async pauseMonitor(monitorId: string): Promise<void> {
    try {
      // Update database
      await db.monitor.update({
        where: { id: monitorId },
        data: { status: "PAUSED" },
      });

      // Pause in scheduler
      await this.scheduler.pauseMonitor(monitorId);

      this.log(`Paused monitor: ${monitorId}`);
    } catch (error) {
      this.log(
        `Error pausing monitor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async resumeMonitor(monitorId: string): Promise<void> {
    try {
      // Update database
      await db.monitor.update({
        where: { id: monitorId },
        data: { status: "ACTIVE" },
      });

      // Resume in scheduler
      await this.scheduler.resumeMonitor(monitorId);

      this.log(`Resumed monitor: ${monitorId}`);
    } catch (error) {
      this.log(
        `Error resuming monitor: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async runMonitorNow(monitorId: string): Promise<MonitoringResult> {
    try {
      const monitor = await db.monitor.findUnique({
        where: { id: monitorId },
        include: { alerts: true },
      });

      if (!monitor) {
        throw new Error(`Monitor ${monitorId} not found`);
      }

      return await this.executeMonitor(monitor);
    } catch (error) {
      this.log(
        `Error running monitor ${monitorId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  async executeMonitor(
    monitor: Monitor & { alerts: Alert[] },
  ): Promise<MonitoringResult> {
    const startTime = Date.now();

    try {
      this.log(`Executing monitor: ${monitor.name} (${monitor.id})`);

      let scrapeResult: ScrapeResult;

      // Check if this is a Whop monitor
      if (monitor.type === "WHOP_METRICS") {
        scrapeResult = await this.executeWhopMonitor(monitor);
      } else {
        // Build scraping options based on monitor type
        const scrapeOptions = this.buildScrapeOptions(monitor);
        // Execute scraping
        scrapeResult = await WebScraper.quickScrape(scrapeOptions);
      }

      // Get previous data for comparison
      const previousCheck = await db.monitorCheck.findFirst({
        where: { monitorId: monitor.id },
        orderBy: { createdAt: "desc" },
      });

      let evaluationResults: EvaluationResult[] = [];
      let groupEvaluationResults: GroupEvaluationResult[] = [];
      let alertsTriggered: string[] = [];

      // Evaluate conditions if scraping was successful
      if (scrapeResult.success && scrapeResult.data) {
        const evaluationContext = this.buildEvaluationContext(
          monitor,
          scrapeResult.data,
          previousCheck,
        );

        // Evaluate alert conditions
        for (const alert of monitor.alerts) {
          const alertResults = await this.evaluateAlertConditions(
            alert,
            evaluationContext,
          );
          evaluationResults.push(...alertResults.evaluationResults);
          groupEvaluationResults.push(...alertResults.groupEvaluationResults);

          if (alertResults.shouldTrigger) {
            alertsTriggered.push(alert.id);
          }
        }
      }

      // Store check result
      const checkId = await this.storeCheckResult(
        monitor,
        scrapeResult,
        evaluationResults,
        groupEvaluationResults,
      );

      // Handle alerts
      const incidentIds = await this.handleTriggeredAlerts(
        monitor,
        alertsTriggered,
        scrapeResult,
      );

      // Update stats
      this.updateStatsAfterCheck(
        scrapeResult,
        alertsTriggered.length,
        incidentIds.length,
      );

      const executionTime = Date.now() - startTime;

      return {
        monitorId: monitor.id,
        success: scrapeResult.success,
        scrapeResult,
        evaluationResults,
        groupEvaluationResults,
        alertsTriggered,
        checkId,
        incidentIds,
        executionTime,
        timestamp: new Date(),
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.updateStatsAfterCheck({ success: false } as ScrapeResult, 0, 0);

      return {
        monitorId: monitor.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime,
        timestamp: new Date(),
      };
    }
  }

  private async executeWhopMonitor(monitor: Monitor): Promise<ScrapeResult> {
    const startTime = Date.now();

    try {
      // Parse Whop configuration from monitor
      const whopConfig = monitor.whopMetrics
        ? (JSON.parse(monitor.whopMetrics as string) as WhopMetricsConfig)
        : { companyId: monitor.companyId || "" };

      // Create Whop metrics collector
      const collector = new WhopMetricsCollector(whopConfig);

      // Collect metrics
      const whopResult = await collector.collectMetrics();

      // Convert to ScrapeResult format
      const scrapeResult: ScrapeResult = {
        success: whopResult.success,
        timestamp: whopResult.timestamp,
        responseTime: whopResult.responseTime,
        data: whopResult.success
          ? collector.toScrapedData(whopResult)
          : undefined,
        error: whopResult.error,
      };

      return scrapeResult;
    } catch (error) {
      return {
        success: false,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private buildScrapeOptions(monitor: Monitor): ScrapeOptions {
    // Start with basic options
    const options: ScrapeOptions = {
      url: monitor.url,
      timeout: monitor.timeout * 1000,
      extractPerformance: true,
      extractSEO: true,
      extractAccessibility: true,
    };

    // Add HTTP-specific options
    if (monitor.method) {
      options.userAgent = `WatchTower Pro Monitor/${monitor.id}`;
    }

    if (monitor.headers) {
      options.headers = JSON.parse(monitor.headers as string);
    }

    // Configure based on monitor type
    switch (monitor.type) {
      case "HTTP":
      case "HTTPS":
        options.extractPrices = true;
        options.extractMetrics = true;
        options.extractSocialMedia = true;
        break;

      case "WHOP_METRICS":
      case "WHOP_SALES":
      case "WHOP_USERS":
      case "WHOP_REVENUE":
        if (monitor.whopMetrics) {
          const whopConfig = JSON.parse(monitor.whopMetrics as string);
          options.metricSelectors = whopConfig.metricSelectors || [];
          options.customSelectors = whopConfig.customSelectors || {};
        }
        break;
    }

    // Apply preset configurations
    if (monitor.url.includes("shopify") || monitor.url.includes("commerce")) {
      Object.assign(options, ScrapingPresets.ecommerce(monitor.url));
    } else if (
      monitor.url.includes("facebook") ||
      monitor.url.includes("instagram")
    ) {
      Object.assign(options, ScrapingPresets.competitor(monitor.url));
    }

    return options;
  }

  private buildEvaluationContext(
    monitor: Monitor,
    currentData: any,
    previousCheck: MonitorCheck | null,
  ): ConditionEvaluationContext {
    return {
      currentData,
      previousData: previousCheck?.whopData
        ? JSON.parse(previousCheck.whopData as string)
        : undefined,
      monitorId: monitor.id,
      url: monitor.url,
      timestamp: new Date(),
    };
  }

  private async evaluateAlertConditions(
    alert: Alert,
    context: ConditionEvaluationContext,
  ): Promise<{
    evaluationResults: EvaluationResult[];
    groupEvaluationResults: GroupEvaluationResult[];
    shouldTrigger: boolean;
  }> {
    const evaluationResults: EvaluationResult[] = [];
    const groupEvaluationResults: GroupEvaluationResult[] = [];
    let shouldTrigger = false;

    try {
      const conditions = JSON.parse(alert.conditions as string);

      if (Array.isArray(conditions)) {
        // Simple conditions array
        const results = ConditionEvaluator.evaluateConditions(
          conditions,
          context,
        );
        evaluationResults.push(...results);

        // Determine if alert should trigger (any condition fails)
        shouldTrigger = results.some((r) => !r.passed);
      } else {
        // Condition groups
        const groupResults = ConditionEvaluator.evaluateConditionGroups(
          [conditions],
          context,
        );
        groupEvaluationResults.push(...groupResults);

        // Determine if alert should trigger
        shouldTrigger = groupResults.some((r) => !r.passed);
      }
    } catch (error) {
      this.log(
        `Error evaluating alert conditions for ${alert.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return {
      evaluationResults,
      groupEvaluationResults,
      shouldTrigger,
    };
  }

  private async storeCheckResult(
    monitor: Monitor,
    scrapeResult: ScrapeResult,
    evaluationResults: EvaluationResult[],
    groupEvaluationResults: GroupEvaluationResult[],
  ): Promise<string> {
    try {
      const checkData = {
        monitorId: monitor.id,
        status: scrapeResult.success ? "SUCCESS" as const : "FAILED" as const,
        responseTime: scrapeResult.responseTime,
        statusCode: scrapeResult.data?.statusCode || null,
        responseSize: scrapeResult.data?.html?.length || null,
        responseHeaders: scrapeResult.data?.headers
          ? JSON.stringify(scrapeResult.data.headers)
          : undefined,
        errorMessage: scrapeResult.error || null,
        whopData: scrapeResult.data
          ? JSON.stringify({
              ...scrapeResult.data,
              evaluationResults,
              groupEvaluationResults,
            })
          : undefined,
        checkedAt: scrapeResult.timestamp,
      };

      const check = await db.monitorCheck.create({
        data: checkData,
      });

      // Update monitor last check time
      await db.monitor.update({
        where: { id: monitor.id },
        data: { lastCheck: scrapeResult.timestamp },
      });

      return check.id;
    } catch (error) {
      this.log(
        `Error storing check result: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  private async handleTriggeredAlerts(
    monitor: Monitor,
    alertIds: string[],
    scrapeResult: ScrapeResult,
  ): Promise<string[]> {
    const incidentIds: string[] = [];

    for (const alertId of alertIds) {
      try {
        const alert = await db.alert.findUnique({
          where: { id: alertId },
        });

        if (!alert) continue;

        // Create incident
        const incident = await db.incident.create({
          data: {
            title: `${alert.name} - ${monitor.name}`,
            description: `Alert "${alert.name}" triggered for monitor "${monitor.name}"`,
            severity: this.determineSeverity(alert, scrapeResult),
            status: "OPEN",
            monitorId: monitor.id,
            alertId: alert.id,
            triggeredBy: JSON.stringify({
              monitorUrl: monitor.url,
              scrapeResult,
              timestamp: new Date(),
            }),
          },
        });

        incidentIds.push(incident.id);

        // Send notifications
        await this.sendNotifications(alert, monitor, incident, scrapeResult);

        this.log(`Created incident ${incident.id} for alert ${alertId}`);
      } catch (error) {
        this.log(
          `Error handling alert ${alertId}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return incidentIds;
  }

  private determineSeverity(
    alert: Alert,
    scrapeResult: ScrapeResult,
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    // Logic to determine severity based on alert type and scrape result
    if (!scrapeResult.success) {
      return "HIGH";
    }

    if (alert.type === "DOWN") {
      return "CRITICAL";
    }

    if (scrapeResult.responseTime > 10000) {
      return "HIGH";
    }

    return "MEDIUM";
  }

  private async sendNotifications(
    alert: Alert,
    monitor: Monitor,
    incident: any,
    scrapeResult: ScrapeResult,
  ): Promise<void> {
    try {
      // Import notification service
      const NotificationService = (await import('@/lib/notifications/notification-service')).default;
      const notificationService = NotificationService.getInstance();

      // Determine severity based on alert type and response
      const severity = this.determineSeverityLevel(alert, scrapeResult);

      // Create notification payload
      const payload = {
        title: `Alert: ${alert.name}`,
        message: this.generateAlertMessage(alert, monitor, scrapeResult),
        severity,
        metadata: {
          monitorId: monitor.id,
          incidentId: incident.id,
          url: monitor.url,
          responseTime: scrapeResult.responseTime,
          error: scrapeResult.error,
          alertType: alert.type,
        },
                 url: `${typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?monitor=${monitor.id}`,
        timestamp: new Date(),
      };

      // Send notifications through all configured channels
      if (alert.channels && Array.isArray(alert.channels)) {
        await notificationService.sendNotification(
          monitor.userId,
          alert.id,
          alert.channels,
          payload,
          incident.id
        );
      }

    } catch (error) {
      this.log(
        `Error sending notifications: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private determineSeverityLevel(alert: Alert, scrapeResult: ScrapeResult): 'low' | 'medium' | 'high' | 'critical' {
    // Determine severity based on alert type and response
    if (alert.type === 'DOWN') {
      return 'critical';
    } else if (alert.type === 'SLOW_RESPONSE') {
      return 'high';
    } else if (alert.type === 'SSL_EXPIRY') {
      return 'medium';
    } else if (alert.type === 'WHOP_THRESHOLD' || alert.type === 'WHOP_ANOMALY') {
      return 'high';
    } else {
      return 'medium';
    }
  }

  private generateAlertMessage(alert: Alert, monitor: Monitor, scrapeResult: ScrapeResult): string {
    const baseMessage = `Monitor "${monitor.name}" has triggered an alert: ${alert.name}`;
    
    if (!scrapeResult.success && scrapeResult.error) {
      return `${baseMessage}\n\nError: ${scrapeResult.error}`;
    }

    if (scrapeResult.responseTime) {
      return `${baseMessage}\n\nResponse time: ${scrapeResult.responseTime}ms`;
    }

    return baseMessage;
  }

  private async syncMonitors(): Promise<void> {
    try {
      const monitors = await db.monitor.findMany({
        where: { status: "ACTIVE" },
      });

      for (const monitor of monitors) {
        await this.scheduler.addMonitor(monitor);
      }

      this.log(`Synced ${monitors.length} monitors with scheduler`);
    } catch (error) {
      this.log(
        `Error syncing monitors: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async updateStats(): Promise<void> {
    try {
      const monitors = await db.monitor.aggregate({
        _count: { id: true },
      });

      const activeMonitors = await db.monitor.count({
        where: { status: "ACTIVE" },
      });

      const checks = await db.monitorCheck.aggregate({
        _count: { id: true },
        _avg: { responseTime: true },
      });

      const successfulChecks = await db.monitorCheck.count({
        where: { status: "SUCCESS" },
      });

      const alerts = await db.incident.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        },
      });

      this.stats = {
        totalMonitors: monitors._count.id,
        activeMonitors,
        failedMonitors: monitors._count.id - activeMonitors,
        totalChecks: checks._count.id,
        successfulChecks,
        failedChecks: checks._count.id - successfulChecks,
        averageResponseTime: checks._avg.responseTime || 0,
        alertsTriggered: alerts,
        incidentsCreated: alerts,
        lastCheckTime: new Date(),
      };
    } catch (error) {
      this.log(
        `Error updating stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private updateStatsAfterCheck(
    scrapeResult: ScrapeResult,
    alertsTriggered: number,
    incidentsCreated: number,
  ): void {
    this.stats.totalChecks++;

    if (scrapeResult.success) {
      this.stats.successfulChecks++;
    } else {
      this.stats.failedChecks++;
    }

    this.stats.alertsTriggered += alertsTriggered;
    this.stats.incidentsCreated += incidentsCreated;
    this.stats.lastCheckTime = new Date();

    // Update average response time
    if (scrapeResult.responseTime) {
      this.stats.averageResponseTime =
        (this.stats.averageResponseTime + scrapeResult.responseTime) / 2;
    }
  }

  getStats(): MonitoringStats {
    return { ...this.stats };
  }

  getSchedulerMetrics() {
    return this.scheduler.getSchedulerMetrics();
  }

  getScheduler(): MonitorScheduler {
    return this.scheduler;
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(
        `[MonitoringEngine] ${new Date().toISOString()} - ${message}`,
      );
    }
  }
}

// Singleton instance
let engineInstance: MonitoringEngine | null = null;

export function getMonitoringEngine(
  config?: MonitoringEngineConfig,
): MonitoringEngine {
  if (!engineInstance) {
    engineInstance = new MonitoringEngine(config);
  }
  return engineInstance;
}

export function createMonitoringEngine(
  config?: MonitoringEngineConfig,
): MonitoringEngine {
  return new MonitoringEngine(config);
}

// Utility functions for creating common monitoring scenarios
export const MonitoringTemplates = {
  // E-commerce price monitoring
  ecommercePriceMonitor: (
    url: string,
    userId: string,
    priceThreshold: number,
  ) => ({
    name: `Price Monitor - ${new URL(url).hostname}`,
    url,
    type: "HTTP" as const,
    interval: 3600, // 1 hour
    userId,
    expectedKeywords: ["price", "cost", "buy"],
    whopMetrics: JSON.stringify({
      priceSelectors: [".price", ".cost", ".amount"],
      customSelectors: {
        productTitle: "h1",
        availability: ".availability",
      },
    }),
  }),

  // Campaign performance monitoring
  campaignMonitor: (url: string, userId: string, cpmThreshold: number) => ({
    name: `Campaign Monitor - ${new URL(url).hostname}`,
    url,
    type: "WHOP_METRICS" as const,
    interval: 1800, // 30 minutes
    userId,
    whopMetrics: JSON.stringify({
      metricSelectors: [
        { name: "cpm", selector: "[data-cpm]", type: "number" },
        { name: "clicks", selector: "[data-clicks]", type: "number" },
        { name: "impressions", selector: "[data-impressions]", type: "number" },
      ],
    }),
  }),

  // Competitor monitoring
  competitorMonitor: (url: string, userId: string) => ({
    name: `Competitor Monitor - ${new URL(url).hostname}`,
    url,
    type: "HTTP" as const,
    interval: 7200, // 2 hours
    userId,
    expectedKeywords: ["new", "launch", "product"],
    whopMetrics: JSON.stringify({
      extractSocialMedia: true,
      extractSEO: true,
      customSelectors: {
        latestPost: ".latest-post",
        followerCount: ".follower-count",
      },
    }),
  }),
};

export default MonitoringEngine;
