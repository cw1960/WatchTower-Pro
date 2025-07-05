import { db } from "@/lib/db";
import { whopSdk } from "@/lib/whop-sdk";
import { AlertChannel, NotificationType, NotificationStatus } from "@prisma/client";
import { PricingService, PlanType } from "@/lib/pricing";

export interface NotificationPayload {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  url?: string;
  timestamp?: Date;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryable?: boolean;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface DiscordConfig {
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
}

export interface WhopNotificationConfig {
  companyId: string;
  userId: string;
  appId: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private emailConfig: EmailConfig | null = null;
  private nodemailer: any = null;

  private constructor() {
    this.initializeEmail();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeEmail(): Promise<void> {
    try {
      // Initialize nodemailer if email config is available
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.nodemailer = require('nodemailer');
        this.emailConfig = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
        };
      }
    } catch (error) {
      console.warn('Email service not available:', error);
    }
  }

  /**
   * Send notification through multiple channels
   */
  async sendNotification(
    userId: string,
    alertId: string,
    channels: AlertChannel[],
    payload: NotificationPayload,
    incidentId?: string
  ): Promise<void> {
    // Get user's plan to check notification limits
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true, whopId: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const planType = user.plan as PlanType;
    const allowedChannels = this.getAllowedChannels(planType, channels);

    // Send notifications through each allowed channel
    for (const channel of allowedChannels) {
      try {
        let result: NotificationResult;
        let notificationType: NotificationType;

        switch (channel) {
          case 'EMAIL':
            result = await this.sendEmailNotification(user.email, payload);
            notificationType = NotificationType.EMAIL;
            break;
          case 'DISCORD':
            result = await this.sendDiscordNotification(userId, payload);
            notificationType = NotificationType.DISCORD;
            break;
          case 'PUSH':
            result = await this.sendWhopNotification(userId, payload);
            notificationType = NotificationType.PUSH;
            break;
          case 'WEBHOOK':
            result = await this.sendWebhookNotification(userId, payload);
            notificationType = NotificationType.WEBHOOK;
            break;
          default:
            continue;
        }

        // Log notification result
        await this.logNotification(
          userId,
          alertId,
          incidentId,
          notificationType,
          result,
          payload
        );

        // If notification failed and is retryable, schedule retry
        if (!result.success && result.retryable) {
          await this.scheduleRetry(userId, alertId, channel, payload, incidentId);
        }

      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        
        // Log failed notification
        await this.logNotification(
          userId,
          alertId,
          incidentId,
          this.channelToNotificationType(channel),
          { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
          payload
        );
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    recipient: string,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    if (!this.emailConfig || !this.nodemailer) {
      return {
        success: false,
        error: 'Email service not configured',
        retryable: false
      };
    }

    try {
      const transporter = this.nodemailer.createTransporter(this.emailConfig);
      
      const html = this.generateEmailHTML(payload);
      const text = this.generateEmailText(payload);

      const info = await transporter.sendMail({
        from: this.emailConfig.from,
        to: recipient,
        subject: payload.title,
        text,
        html,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true
      };
    }
  }

  /**
   * Send Discord webhook notification
   */
  private async sendDiscordNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    try {
      // Get user's Discord webhook URL from user settings
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { settings: true }
      });

      const settings = user?.settings as any;
      const webhookUrl = settings?.discord?.webhookUrl;

      if (!webhookUrl) {
        return {
          success: false,
          error: 'Discord webhook not configured',
          retryable: false
        };
      }

      const embed = this.generateDiscordEmbed(payload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'WatchTower Pro',
          avatar_url: 'https://watchtowerpro.com/logo.png',
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`);
      }

      return {
        success: true,
        messageId: response.headers.get('x-ratelimit-reset-after') || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true
      };
    }
  }

  /**
   * Send Whop native notification
   */
  private async sendWhopNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    try {
      // Get user's Whop ID
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { whopId: true }
      });

      if (!user?.whopId) {
        return {
          success: false,
          error: 'Whop user ID not found',
          retryable: false
        };
      }

      // Send notification through Whop SDK
      // Note: This is a placeholder - actual implementation depends on available Whop SDK methods
      const notification = {
        userId: user.whopId,
        title: payload.title,
        message: payload.message,
        url: payload.url,
        timestamp: payload.timestamp || new Date(),
        severity: payload.severity,
      };

      // TODO: Replace with actual Whop SDK notification method when available
      console.log('Sending Whop notification:', notification);

      return {
        success: true,
        messageId: `whop_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true
      };
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    try {
      // Get user's webhook URL from settings
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { settings: true }
      });

      const settings = user?.settings as any;
      const webhookUrl = settings?.webhook?.url;

      if (!webhookUrl) {
        return {
          success: false,
          error: 'Webhook URL not configured',
          retryable: false
        };
      }

      const webhookPayload = {
        ...payload,
        timestamp: payload.timestamp || new Date(),
        source: 'WatchTower Pro',
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WatchTower Pro/1.0',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      return {
        success: true,
        messageId: response.headers.get('x-request-id') || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true
      };
    }
  }

  /**
   * Get allowed notification channels based on plan type
   */
  private getAllowedChannels(planType: PlanType, requestedChannels: AlertChannel[]): AlertChannel[] {
    const allowedChannels: AlertChannel[] = [];

    for (const channel of requestedChannels) {
      switch (channel) {
        case 'EMAIL':
          // Email is available for all plans
          allowedChannels.push(channel);
          break;
        case 'DISCORD':
        case 'WEBHOOK':
          // Advanced channels for Pro and Enterprise
          if (PricingService.hasFeatureAccess(planType, 'advancedNotifications')) {
            allowedChannels.push(channel);
          }
          break;
        case 'PUSH':
          // Whop native notifications for all plans
          allowedChannels.push(channel);
          break;
        case 'SMS':
          // SMS for Enterprise only
          if (planType === PlanType.ENTERPRISE) {
            allowedChannels.push(channel);
          }
          break;
        default:
          break;
      }
    }

    return allowedChannels;
  }

  /**
   * Log notification result to database
   */
  private async logNotification(
    userId: string,
    alertId: string,
    incidentId: string | undefined,
    type: NotificationType,
    result: NotificationResult,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      await db.notification.create({
        data: {
          type,
          status: result.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
          recipient: userId,
          subject: payload.title,
          content: payload.message,
          metadata: JSON.stringify({
            severity: payload.severity,
            messageId: result.messageId,
            error: result.error,
            ...payload.metadata,
          }),
          sentAt: result.success ? new Date() : undefined,
          errorMessage: result.error,
          userId,
          alertId,
          incidentId,
        },
      });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  /**
   * Schedule notification retry
   */
  private async scheduleRetry(
    userId: string,
    alertId: string,
    channel: AlertChannel,
    payload: NotificationPayload,
    incidentId?: string
  ): Promise<void> {
    // TODO: Implement retry queue using a job queue system
    // For now, just log the retry requirement
    console.log(`Scheduling retry for ${channel} notification:`, {
      userId,
      alertId,
      incidentId,
      payload: payload.title,
    });
  }

  /**
   * Generate email HTML template
   */
  private generateEmailHTML(payload: NotificationPayload): string {
    const severityColors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626',
    };

    const color = severityColors[payload.severity] || '#6b7280';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${payload.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .header { background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; }
            .severity { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: ${color}; background: ${color}20; }
            .footer { padding: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; padding: 10px 20px; background: ${color}; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">WatchTower Pro Alert</h1>
              <div class="severity">${payload.severity}</div>
            </div>
            <div class="content">
              <h2 style="margin: 0 0 10px 0; color: #1f2937;">${payload.title}</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; line-height: 1.5;">${payload.message}</p>
              ${payload.url ? `<a href="${payload.url}" class="button">View Details</a>` : ''}
            </div>
            <div class="footer">
              <p style="margin: 0;">This alert was sent by WatchTower Pro monitoring system.</p>
              <p style="margin: 5px 0 0 0;">Time: ${payload.timestamp?.toLocaleString() || new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate email text template
   */
  private generateEmailText(payload: NotificationPayload): string {
    return `
WatchTower Pro Alert - ${payload.severity.toUpperCase()}

${payload.title}

${payload.message}

${payload.url ? `View Details: ${payload.url}` : ''}

Time: ${payload.timestamp?.toLocaleString() || new Date().toLocaleString()}

---
This alert was sent by WatchTower Pro monitoring system.
    `.trim();
  }

  /**
   * Generate Discord embed
   */
  private generateDiscordEmbed(payload: NotificationPayload): any {
    const severityColors = {
      low: 0x22c55e,
      medium: 0xf59e0b,
      high: 0xef4444,
      critical: 0xdc2626,
    };

    return {
      title: payload.title,
      description: payload.message,
      color: severityColors[payload.severity] || 0x6b7280,
      timestamp: payload.timestamp?.toISOString() || new Date().toISOString(),
      footer: {
        text: 'WatchTower Pro',
        icon_url: 'https://watchtowerpro.com/logo.png',
      },
      fields: [
        {
          name: 'Severity',
          value: payload.severity.toUpperCase(),
          inline: true,
        },
        ...(payload.url ? [{
          name: 'Details',
          value: `[View Dashboard](${payload.url})`,
          inline: true,
        }] : []),
      ],
    };
  }

  /**
   * Convert AlertChannel to NotificationType
   */
  private channelToNotificationType(channel: AlertChannel): NotificationType {
    switch (channel) {
      case 'EMAIL':
        return NotificationType.EMAIL;
      case 'DISCORD':
        return NotificationType.DISCORD;
      case 'WEBHOOK':
        return NotificationType.WEBHOOK;
      case 'SMS':
        return NotificationType.SMS;
      case 'PUSH':
        return NotificationType.PUSH;
      default:
        return NotificationType.EMAIL;
    }
  }
}

export default NotificationService; 