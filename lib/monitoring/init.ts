import { getMonitoringEngine } from './engine';

let isInitialized = false;

export async function initializeMonitoringEngine(): Promise<void> {
  if (isInitialized) {
    console.log('[MonitoringEngine] Already initialized, skipping...');
    return;
  }

  try {
    console.log('[MonitoringEngine] Initializing monitoring engine...');
    
    const monitoringEngine = getMonitoringEngine({
      scheduler: {
        maxConcurrentJobs: 10,
        maxRetries: 3,
        retryDelay: 60,
        batchSize: 5,
        healthCheckInterval: 30,
        cleanupInterval: 300,
        maxJobAge: 86400,
        enableMetrics: true,
        enableLogging: true
      },
      enableMetrics: true,
      enableLogging: true
    });

    await monitoringEngine.start();
    
    isInitialized = true;
    console.log('[MonitoringEngine] Monitoring engine initialized successfully');
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[MonitoringEngine] Received SIGTERM, shutting down gracefully...');
      await monitoringEngine.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('[MonitoringEngine] Received SIGINT, shutting down gracefully...');
      await monitoringEngine.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('[MonitoringEngine] Failed to initialize:', error);
    // Don't throw the error to prevent application startup failure
  }
}

export async function shutdownMonitoringEngine(): Promise<void> {
  if (!isInitialized) {
    return;
  }

  try {
    console.log('[MonitoringEngine] Shutting down monitoring engine...');
    
    const monitoringEngine = getMonitoringEngine();
    await monitoringEngine.stop();
    
    isInitialized = false;
    console.log('[MonitoringEngine] Monitoring engine shut down successfully');
    
  } catch (error) {
    console.error('[MonitoringEngine] Error during shutdown:', error);
  }
}

export function isMonitoringEngineInitialized(): boolean {
  return isInitialized;
} 