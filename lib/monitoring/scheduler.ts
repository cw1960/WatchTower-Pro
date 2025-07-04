import { db } from '@/lib/db';
import { Monitor, MonitorStatus, CheckStatus } from '@prisma/client';
import WebScraper, { ScrapeOptions, ScrapeResult } from './scraper';
import ConditionEvaluator, { 
  Condition, 
  ConditionGroup, 
  ConditionEvaluationContext,
  EvaluationResult,
  GroupEvaluationResult 
} from './conditions';

export interface ScheduledJob {
  id: string;
  monitorId: string;
  nextRunTime: Date;
  interval: number; // in seconds
  priority: JobPriority;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED'
}

export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3
}

export interface JobResult {
  jobId: string;
  monitorId: string;
  success: boolean;
  scrapeResult?: ScrapeResult;
  evaluationResults?: EvaluationResult[];
  groupEvaluationResults?: GroupEvaluationResult[];
  alertsTriggered?: string[];
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface SchedulerConfig {
  maxConcurrentJobs: number;
  maxRetries: number;
  retryDelay: number; // in seconds
  batchSize: number;
  healthCheckInterval: number; // in seconds
  cleanupInterval: number; // in seconds
  maxJobAge: number; // in seconds
  enableMetrics: boolean;
  enableLogging: boolean;
}

export interface SchedulerMetrics {
  totalJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageExecutionTime: number;
  successRate: number;
  lastJobTime?: Date;
  uptime: number;
}

export class MonitorScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private runningJobs: Map<string, Promise<JobResult>> = new Map();
  private config: SchedulerConfig;
  private isRunning: boolean = false;
  private schedulerInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private startTime: Date;
  private metrics: SchedulerMetrics;

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = {
      maxConcurrentJobs: 10,
      maxRetries: 3,
      retryDelay: 60,
      batchSize: 5,
      healthCheckInterval: 30,
      cleanupInterval: 300,
      maxJobAge: 86400, // 24 hours
      enableMetrics: true,
      enableLogging: true,
      ...config
    };

    this.startTime = new Date();
    this.metrics = {
      totalJobs: 0,
      runningJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageExecutionTime: 0,
      successRate: 0,
      uptime: 0
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Scheduler is already running');
    }

    this.isRunning = true;
    this.log('Starting monitor scheduler...');

    // Load existing monitors from database
    await this.loadMonitors();

    // Start the main scheduler loop
    this.schedulerInterval = setInterval(async () => {
      await this.processJobs();
    }, 1000); // Check every second

    // Start health check
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval * 1000);

    // Start cleanup
    this.cleanupInterval = setInterval(async () => {
      await this.cleanup();
    }, this.config.cleanupInterval * 1000);

    this.log('Monitor scheduler started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.log('Stopping monitor scheduler...');
    this.isRunning = false;

    // Clear intervals
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Wait for running jobs to complete
    await this.waitForRunningJobs();

    this.log('Monitor scheduler stopped');
  }

  async addMonitor(monitor: Monitor): Promise<void> {
    const job: ScheduledJob = {
      id: `job_${monitor.id}`,
      monitorId: monitor.id,
      nextRunTime: new Date(Date.now() + monitor.interval * 1000),
      interval: monitor.interval,
      priority: this.determineJobPriority(monitor),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      status: JobStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.jobs.set(job.id, job);
    this.log(`Added monitor ${monitor.id} to scheduler`);
  }

  async removeMonitor(monitorId: string): Promise<void> {
    const jobId = `job_${monitorId}`;
    const job = this.jobs.get(jobId);

    if (job) {
      // Cancel if running
      if (job.status === JobStatus.RUNNING) {
        job.status = JobStatus.CANCELLED;
      }

      this.jobs.delete(jobId);
      this.log(`Removed monitor ${monitorId} from scheduler`);
    }
  }

  async updateMonitor(monitor: Monitor): Promise<void> {
    const jobId = `job_${monitor.id}`;
    const job = this.jobs.get(jobId);

    if (job) {
      job.interval = monitor.interval;
      job.priority = this.determineJobPriority(monitor);
      job.updatedAt = new Date();
      
      // Reset next run time if interval changed
      if (job.status === JobStatus.PENDING) {
        job.nextRunTime = new Date(Date.now() + monitor.interval * 1000);
      }

      this.log(`Updated monitor ${monitor.id} in scheduler`);
    } else {
      // Add if not exists
      await this.addMonitor(monitor);
    }
  }

  async pauseMonitor(monitorId: string): Promise<void> {
    const jobId = `job_${monitorId}`;
    const job = this.jobs.get(jobId);

    if (job && job.status === JobStatus.PENDING) {
      job.status = JobStatus.PAUSED;
      this.log(`Paused monitor ${monitorId}`);
    }
  }

  async resumeMonitor(monitorId: string): Promise<void> {
    const jobId = `job_${monitorId}`;
    const job = this.jobs.get(jobId);

    if (job && job.status === JobStatus.PAUSED) {
      job.status = JobStatus.PENDING;
      job.nextRunTime = new Date(Date.now() + job.interval * 1000);
      this.log(`Resumed monitor ${monitorId}`);
    }
  }

  getSchedulerMetrics(): SchedulerMetrics {
    const now = new Date();
    this.metrics.uptime = Math.floor((now.getTime() - this.startTime.getTime()) / 1000);
    this.metrics.runningJobs = this.runningJobs.size;
    
    const totalJobs = this.metrics.completedJobs + this.metrics.failedJobs;
    if (totalJobs > 0) {
      this.metrics.successRate = (this.metrics.completedJobs / totalJobs) * 100;
    }

    return { ...this.metrics };
  }

  getJobStatus(monitorId: string): ScheduledJob | undefined {
    const jobId = `job_${monitorId}`;
    return this.jobs.get(jobId);
  }

  getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  private async loadMonitors(): Promise<void> {
    try {
      const monitors = await db.monitor.findMany({
        where: { status: MonitorStatus.ACTIVE }
      });

      for (const monitor of monitors) {
        await this.addMonitor(monitor);
      }

      this.log(`Loaded ${monitors.length} monitors from database`);
    } catch (error) {
      this.log(`Error loading monitors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processJobs(): Promise<void> {
    if (!this.isRunning) return;

    const now = new Date();
    const readyJobs = Array.from(this.jobs.values())
      .filter(job => 
        job.status === JobStatus.PENDING && 
        job.nextRunTime <= now &&
        !this.runningJobs.has(job.id)
      )
      .sort((a, b) => b.priority - a.priority || a.nextRunTime.getTime() - b.nextRunTime.getTime())
      .slice(0, this.config.batchSize);

    if (readyJobs.length === 0) return;

    // Check if we can run more jobs
    const availableSlots = this.config.maxConcurrentJobs - this.runningJobs.size;
    const jobsToRun = readyJobs.slice(0, availableSlots);

    for (const job of jobsToRun) {
      await this.executeJob(job);
    }
  }

  private async executeJob(job: ScheduledJob): Promise<void> {
    job.status = JobStatus.RUNNING;
    job.updatedAt = new Date();

    const jobPromise = this.runMonitorJob(job);
    this.runningJobs.set(job.id, jobPromise);

    try {
      const result = await jobPromise;
      await this.handleJobResult(job, result);
    } catch (error) {
      await this.handleJobError(job, error);
    } finally {
      this.runningJobs.delete(job.id);
    }
  }

  private async runMonitorJob(job: ScheduledJob): Promise<JobResult> {
    const startTime = Date.now();
    
    try {
      // Get monitor from database
      const monitor = await db.monitor.findUnique({
        where: { id: job.monitorId },
        include: { alerts: true }
      });

      if (!monitor) {
        throw new Error(`Monitor ${job.monitorId} not found`);
      }

      // Build scraping options
      const scrapeOptions = this.buildScrapeOptions(monitor);
      
      // Execute scraping
      const scrapeResult = await WebScraper.quickScrape(scrapeOptions);

      // Get previous data for comparison
      const previousCheck = await db.monitorCheck.findFirst({
        where: { monitorId: job.monitorId },
        orderBy: { createdAt: 'desc' }
      });

      // Evaluate conditions if alerts exist
      let evaluationResults: EvaluationResult[] = [];
      let groupEvaluationResults: GroupEvaluationResult[] = [];
      let alertsTriggered: string[] = [];

      if (monitor.alerts.length > 0 && scrapeResult.success) {
        const context: ConditionEvaluationContext = {
          currentData: scrapeResult.data!,
          previousData: previousCheck?.whopData ? JSON.parse(previousCheck.whopData as string) : undefined,
          monitorId: monitor.id,
          url: monitor.url,
          timestamp: new Date()
        };

        for (const alert of monitor.alerts) {
          const conditions = JSON.parse(alert.conditions as string);
          
          if (Array.isArray(conditions)) {
            // Simple conditions array
            const results = ConditionEvaluator.evaluateConditions(conditions, context);
            evaluationResults.push(...results);
            
            // Check if alert should be triggered
            const alertTriggered = results.some(r => !r.passed);
            if (alertTriggered) {
              alertsTriggered.push(alert.id);
            }
          } else {
            // Condition groups
            const groupResults = ConditionEvaluator.evaluateConditionGroups([conditions], context);
            groupEvaluationResults.push(...groupResults);
            
            // Check if alert should be triggered
            const alertTriggered = groupResults.some(r => !r.passed);
            if (alertTriggered) {
              alertsTriggered.push(alert.id);
            }
          }
        }
      }

      // Store check result
      await this.storeCheckResult(monitor, scrapeResult, evaluationResults, groupEvaluationResults);

      // Trigger alerts if needed
      if (alertsTriggered.length > 0) {
        await this.triggerAlerts(alertsTriggered, monitor, scrapeResult);
      }

      const executionTime = Date.now() - startTime;

      return {
        jobId: job.id,
        monitorId: job.monitorId,
        success: true,
        scrapeResult,
        evaluationResults,
        groupEvaluationResults,
        alertsTriggered,
        executionTime,
        timestamp: new Date()
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        jobId: job.id,
        monitorId: job.monitorId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
        timestamp: new Date()
      };
    }
  }

  private buildScrapeOptions(monitor: Monitor): ScrapeOptions {
    const options: ScrapeOptions = {
      url: monitor.url,
      timeout: monitor.timeout * 1000,
      extractPerformance: true,
      extractSEO: true,
      extractPrices: true,
      extractMetrics: true
    };

    // Add headers if provided
    if (monitor.headers) {
      options.headers = JSON.parse(monitor.headers as string);
    }

    // Add specific configurations based on monitor type
    switch (monitor.type) {
      case 'HTTP':
      case 'HTTPS':
        options.method = monitor.method;
        if (monitor.body) {
          options.actions = [
            { type: 'wait', delay: 1000 }
          ];
        }
        break;

      case 'WHOP_METRICS':
      case 'WHOP_SALES':
      case 'WHOP_USERS':
      case 'WHOP_REVENUE':
        // Add Whop-specific scraping configuration
        if (monitor.whopMetrics) {
          const whopConfig = JSON.parse(monitor.whopMetrics as string);
          options.metricSelectors = whopConfig.metricSelectors || [];
          options.customSelectors = whopConfig.customSelectors || {};
        }
        break;
    }

    return options;
  }

  private async storeCheckResult(
    monitor: Monitor,
    scrapeResult: ScrapeResult,
    evaluationResults: EvaluationResult[],
    groupEvaluationResults: GroupEvaluationResult[]
  ): Promise<void> {
    try {
      await db.monitorCheck.create({
        data: {
          monitorId: monitor.id,
          status: scrapeResult.success ? CheckStatus.SUCCESS : CheckStatus.FAILED,
          responseTime: scrapeResult.responseTime,
          statusCode: scrapeResult.data?.statusCode,
          responseSize: scrapeResult.data?.html?.length,
          responseHeaders: scrapeResult.data?.headers ? JSON.stringify(scrapeResult.data.headers) : null,
          errorMessage: scrapeResult.error,
          whopData: scrapeResult.data ? JSON.stringify({
            ...scrapeResult.data,
            evaluationResults,
            groupEvaluationResults
          }) : null,
          checkedAt: scrapeResult.timestamp
        }
      });

      // Update monitor last check time
      await db.monitor.update({
        where: { id: monitor.id },
        data: { lastCheck: scrapeResult.timestamp }
      });

    } catch (error) {
      this.log(`Error storing check result for monitor ${monitor.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async triggerAlerts(alertIds: string[], monitor: Monitor, scrapeResult: ScrapeResult): Promise<void> {
    try {
      // This would integrate with the alerts system
      // For now, just log the alerts
      this.log(`Alerts triggered for monitor ${monitor.id}: ${alertIds.join(', ')}`);
      
      // Create incidents for triggered alerts
      for (const alertId of alertIds) {
        await db.incident.create({
          data: {
            title: `Alert triggered for ${monitor.name}`,
            description: `Monitor ${monitor.name} has triggered an alert condition`,
            severity: 'MEDIUM',
            status: 'OPEN',
            monitorId: monitor.id,
            alertId,
            userId: monitor.userId,
            companyId: monitor.companyId,
            metadata: JSON.stringify({
              scrapeResult,
              url: monitor.url,
              timestamp: new Date()
            })
          }
        });
      }
    } catch (error) {
      this.log(`Error triggering alerts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleJobResult(job: ScheduledJob, result: JobResult): Promise<void> {
    if (result.success) {
      job.status = JobStatus.COMPLETED;
      job.retryCount = 0;
      job.nextRunTime = new Date(Date.now() + job.interval * 1000);
      
      this.metrics.completedJobs++;
      this.updateAverageExecutionTime(result.executionTime);
    } else {
      await this.handleJobError(job, new Error(result.error || 'Unknown error'));
    }

    job.updatedAt = new Date();
    this.metrics.lastJobTime = new Date();
  }

  private async handleJobError(job: ScheduledJob, error: any): Promise<void> {
    job.retryCount++;
    job.lastError = error instanceof Error ? error.message : 'Unknown error';
    job.updatedAt = new Date();

    if (job.retryCount >= job.maxRetries) {
      job.status = JobStatus.FAILED;
      this.metrics.failedJobs++;
      this.log(`Job ${job.id} failed after ${job.maxRetries} retries: ${job.lastError}`);
    } else {
      job.status = JobStatus.PENDING;
      job.nextRunTime = new Date(Date.now() + this.config.retryDelay * 1000);
      this.log(`Job ${job.id} failed (attempt ${job.retryCount}/${job.maxRetries}), retrying in ${this.config.retryDelay}s`);
    }
  }

  private determineJobPriority(monitor: Monitor): JobPriority {
    // Determine priority based on monitor type and interval
    if (monitor.type.startsWith('WHOP_')) {
      return JobPriority.HIGH;
    }
    
    if (monitor.interval <= 60) {
      return JobPriority.URGENT;
    } else if (monitor.interval <= 300) {
      return JobPriority.HIGH;
    } else if (monitor.interval <= 1800) {
      return JobPriority.NORMAL;
    } else {
      return JobPriority.LOW;
    }
  }

  private updateAverageExecutionTime(executionTime: number): void {
    if (this.metrics.averageExecutionTime === 0) {
      this.metrics.averageExecutionTime = executionTime;
    } else {
      this.metrics.averageExecutionTime = (this.metrics.averageExecutionTime + executionTime) / 2;
    }
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Check database connectivity
      await db.monitor.count();
      
      // Check for stuck jobs
      const stuckJobs = Array.from(this.jobs.values()).filter(job => {
        const timeSinceUpdate = Date.now() - job.updatedAt.getTime();
        return job.status === JobStatus.RUNNING && timeSinceUpdate > 300000; // 5 minutes
      });

      if (stuckJobs.length > 0) {
        this.log(`Found ${stuckJobs.length} stuck jobs, resetting to pending`);
        stuckJobs.forEach(job => {
          job.status = JobStatus.PENDING;
          job.nextRunTime = new Date(Date.now() + 60000); // Retry in 1 minute
        });
      }

      // Check memory usage and clean up if needed
      const memoryUsage = process.memoryUsage();
      if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        this.log('High memory usage detected, forcing garbage collection');
        if (global.gc) {
          global.gc();
        }
      }

    } catch (error) {
      this.log(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async cleanup(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Remove old completed/failed jobs
      const cutoffTime = new Date(Date.now() - this.config.maxJobAge * 1000);
      const jobsToRemove = Array.from(this.jobs.entries()).filter(([_, job]) => 
        (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) &&
        job.updatedAt < cutoffTime
      );

      for (const [jobId, _] of jobsToRemove) {
        this.jobs.delete(jobId);
      }

      if (jobsToRemove.length > 0) {
        this.log(`Cleaned up ${jobsToRemove.length} old jobs`);
      }

    } catch (error) {
      this.log(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async waitForRunningJobs(): Promise<void> {
    if (this.runningJobs.size === 0) return;

    this.log(`Waiting for ${this.runningJobs.size} running jobs to complete...`);
    await Promise.all(Array.from(this.runningJobs.values()));
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[MonitorScheduler] ${new Date().toISOString()} - ${message}`);
    }
  }
}

// Singleton instance
let schedulerInstance: MonitorScheduler | null = null;

export function getScheduler(config?: Partial<SchedulerConfig>): MonitorScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new MonitorScheduler(config);
  }
  return schedulerInstance;
}

export function createScheduler(config?: Partial<SchedulerConfig>): MonitorScheduler {
  return new MonitorScheduler(config);
}

export default MonitorScheduler; 