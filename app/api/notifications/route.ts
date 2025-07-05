import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whopAuth } from "@/lib/whop-sdk";
import { z } from "zod";

const retryNotificationSchema = z.object({
  notificationId: z.string(),
});

const markNotificationSchema = z.object({
  status: z.enum(["PENDING", "SENT", "DELIVERED", "FAILED", "BOUNCED"]),
  errorMessage: z.string().optional(),
  deliveredAt: z.string().datetime().optional(),
});

// GET /api/notifications - Get notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const alertId = searchParams.get("alertId");
    const incidentId = searchParams.get("incidentId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause based on filters
    const where: any = {
      userId: userId
    };

    if (alertId) {
      where.alertId = alertId;
    }

    if (incidentId) {
      where.incidentId = incidentId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const notifications = await db.notification.findMany({
      where,
      include: {
        alert: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        incident: {
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : 100,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/notifications - Manually send a notification or retry failed ones
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...actionData } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (action) {
      case 'retry': {
        const { notificationId } = retryNotificationSchema.parse(actionData);
        
        // Get the notification
        const notification = await db.notification.findFirst({
          where: { 
            id: notificationId,
            userId: userId 
          },
          include: {
            alert: true,
            incident: true,
          },
        });

        if (!notification) {
          return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
        }

        // Only retry failed notifications
        if (notification.status !== 'FAILED') {
          return NextResponse.json({ error: "Only failed notifications can be retried" }, { status: 400 });
        }

        // Import and use notification service to retry
        const NotificationService = (await import('@/lib/notifications/notification-service')).default;
        const notificationService = NotificationService.getInstance();

        // Create payload from existing notification
        const payload = {
          title: notification.subject || 'Retry Notification',
          message: notification.content,
          severity: 'medium' as const,
          metadata: notification.metadata ? JSON.parse(notification.metadata as string) : {},
          timestamp: new Date(),
        };

        // Determine channel from notification type
        const channels = [notification.type === 'EMAIL' ? 'EMAIL' : 
                        notification.type === 'DISCORD' ? 'DISCORD' :
                        notification.type === 'WEBHOOK' ? 'WEBHOOK' :
                        notification.type === 'SMS' ? 'SMS' : 'PUSH'] as any[];

        // Send notification
        await notificationService.sendNotification(
          userId,
          notification.alertId || '',
          channels,
          payload,
          notification.incidentId || undefined
        );

        return NextResponse.json({ message: "Notification retry initiated" });
      }

      case 'test': {
        // Send a test notification
        const NotificationService = (await import('@/lib/notifications/notification-service')).default;
        const notificationService = NotificationService.getInstance();

        const payload = {
          title: 'Test Notification from WatchTower Pro',
          message: 'This is a test notification to verify your notification settings are working correctly.',
          severity: 'low' as const,
          metadata: { test: true },
          timestamp: new Date(),
        };

        // Send test notification via email (available for all plans)
        await notificationService.sendNotification(
          userId,
          'test-alert',
          ['EMAIL'],
          payload
        );

        return NextResponse.json({ message: "Test notification sent" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error processing notification action:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/notifications - Update notification status (for webhooks/callbacks)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, ...updateData } = body;
    
    if (!id || !userId) {
      return NextResponse.json({ error: "Notification ID and User ID are required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if notification exists and belongs to user
    const existingNotification = await db.notification.findFirst({
      where: { 
        id,
        userId: userId 
      },
    });

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
    }

    // Validate input
    const validatedData = markNotificationSchema.parse(updateData);

    // Update the notification
    const notification = await db.notification.update({
      where: { id },
      data: {
        ...validatedData,
        deliveredAt: validatedData.deliveredAt ? new Date(validatedData.deliveredAt) : undefined,
      },
      include: {
        alert: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        incident: {
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/notifications - Delete notification history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate user access
    const hasAccess = await whopAuth.validateUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === 'clear-all') {
      // Clear all notifications for user (keep last 30 days for safety)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await db.notification.deleteMany({
        where: { 
          userId: userId,
          createdAt: {
            lt: thirtyDaysAgo
          }
        },
      });

      return NextResponse.json({ message: "Old notifications cleared successfully" });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    // Check if notification exists and belongs to user
    const existingNotification = await db.notification.findFirst({
      where: { 
        id,
        userId: userId 
      },
    });

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
    }

    // Delete the notification
    await db.notification.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 