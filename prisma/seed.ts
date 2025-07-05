import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      whopId: "whop_user_1",
      email: "admin@example.com",
      name: "Admin User",
      plan: "PROFESSIONAL",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      whopId: "whop_user_2",
      email: "user@example.com",
      name: "Regular User",
      plan: "FREE",
    },
  });

  console.log("✅ Created users:", { user1: user1.name, user2: user2.name });

  // Create sample monitors
  const monitor1 = await prisma.monitor.upsert({
    where: { id: "monitor_1" },
    update: {},
    create: {
      id: "monitor_1",
      name: "Main Website",
      url: "https://example.com",
      type: "HTTP",
      status: "ACTIVE",
      interval: 300,
      timeout: 30,
      retries: 3,
      method: "GET",
      expectedStatus: 200,
      userId: user1.id,
      lastCheck: new Date(),
    },
  });

  const monitor2 = await prisma.monitor.upsert({
    where: { id: "monitor_2" },
    update: {},
    create: {
      id: "monitor_2",
      name: "API Endpoint",
      url: "https://api.example.com",
      type: "HTTP",
      status: "ACTIVE",
      interval: 600,
      timeout: 30,
      retries: 3,
      method: "GET",
      expectedStatus: 200,
      userId: user1.id,
      lastCheck: new Date(),
    },
  });

  const monitor3 = await prisma.monitor.upsert({
    where: { id: "monitor_3" },
    update: {},
    create: {
      id: "monitor_3",
      name: "Shop Page",
      url: "https://shop.example.com",
      type: "HTTP",
      status: "PAUSED",
      interval: 900,
      timeout: 30,
      retries: 3,
      method: "GET",
      expectedStatus: 200,
      userId: user2.id,
      lastCheck: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
  });

  console.log("✅ Created monitors:", {
    monitor1: monitor1.name,
    monitor2: monitor2.name,
    monitor3: monitor3.name,
  });

  // Create sample monitor checks
  const now = new Date();
  const checks = [];

  // Create checks for monitor1 (mostly successful)
  for (let i = 0; i < 10; i++) {
    const checkTime = new Date(now.getTime() - i * 5 * 60 * 1000); // Every 5 minutes
    const isSuccess = Math.random() > 0.1; // 90% success rate

    const check = await prisma.monitorCheck.create({
      data: {
        monitorId: monitor1.id,
        status: isSuccess ? "SUCCESS" : "FAILED",
        responseTime: isSuccess ? Math.floor(Math.random() * 500) + 100 : null,
        statusCode: isSuccess ? 200 : 500,
        responseSize: isSuccess
          ? Math.floor(Math.random() * 10000) + 1000
          : null,
        errorMessage: isSuccess ? null : "Connection timeout",
        checkedAt: checkTime,
        createdAt: checkTime,
      },
    });
    checks.push(check);
  }

  // Create checks for monitor2 (excellent performance)
  for (let i = 0; i < 8; i++) {
    const checkTime = new Date(now.getTime() - i * 10 * 60 * 1000); // Every 10 minutes

    const check = await prisma.monitorCheck.create({
      data: {
        monitorId: monitor2.id,
        status: "SUCCESS",
        responseTime: Math.floor(Math.random() * 200) + 50,
        statusCode: 200,
        responseSize: Math.floor(Math.random() * 5000) + 500,
        checkedAt: checkTime,
        createdAt: checkTime,
      },
    });
    checks.push(check);
  }

  // Create checks for monitor3 (some issues)
  for (let i = 0; i < 6; i++) {
    const checkTime = new Date(now.getTime() - i * 15 * 60 * 1000); // Every 15 minutes
    const isSuccess = Math.random() > 0.3; // 70% success rate

    const check = await prisma.monitorCheck.create({
      data: {
        monitorId: monitor3.id,
        status: isSuccess ? "SUCCESS" : "FAILED",
        responseTime: isSuccess ? Math.floor(Math.random() * 800) + 200 : null,
        statusCode: isSuccess ? 200 : Math.random() > 0.5 ? 404 : 500,
        responseSize: isSuccess
          ? Math.floor(Math.random() * 15000) + 2000
          : null,
        errorMessage: isSuccess
          ? null
          : Math.random() > 0.5
            ? "Page not found"
            : "Server error",
        checkedAt: checkTime,
        createdAt: checkTime,
      },
    });
    checks.push(check);
  }

  console.log("✅ Created monitor checks:", checks.length);

  // Create sample alerts
  const alert1 = await prisma.alert.upsert({
    where: { id: "alert_1" },
    update: {},
    create: {
      id: "alert_1",
      name: "Website Down Alert",
      type: "DOWN",
      status: "ACTIVE",
      conditions: {
        type: "status_code",
        operator: "not_equals",
        value: 200,
      },
      threshold: 1,
      duration: 300,
      channels: ["EMAIL"],
      userId: user1.id,
      monitorId: monitor1.id,
    },
  });

  const alert2 = await prisma.alert.upsert({
    where: { id: "alert_2" },
    update: {},
    create: {
      id: "alert_2",
      name: "Slow Response Alert",
      type: "SLOW_RESPONSE",
      status: "ACTIVE",
      conditions: {
        type: "response_time",
        operator: "greater_than",
        value: 3000,
      },
      threshold: 3000,
      duration: 600,
      channels: ["EMAIL", "SLACK"],
      userId: user1.id,
      monitorId: monitor2.id,
    },
  });

  console.log("✅ Created alerts:", {
    alert1: alert1.name,
    alert2: alert2.name,
  });

  // Create sample incidents
  const incident1 = await prisma.incident.upsert({
    where: { id: "incident_1" },
    update: {},
    create: {
      id: "incident_1",
      title: "Website Outage",
      description: "Main website is returning 500 errors",
      severity: "HIGH",
      status: "RESOLVED",
      monitorId: monitor1.id,
      alertId: alert1.id,
      resolvedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  const incident2 = await prisma.incident.upsert({
    where: { id: "incident_2" },
    update: {},
    create: {
      id: "incident_2",
      title: "API Slow Response",
      description: "API endpoint is responding slowly",
      severity: "MEDIUM",
      status: "INVESTIGATING",
      monitorId: monitor2.id,
      alertId: alert2.id,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  });

  console.log("✅ Created incidents:", {
    incident1: incident1.title,
    incident2: incident2.title,
  });

  // Create sample notifications
  const notification1 = await prisma.notification.create({
    data: {
      type: "EMAIL",
      status: "DELIVERED",
      recipient: user1.email,
      subject: "Website Down Alert",
      content:
        "Your website https://example.com is down. Status: 500 Internal Server Error.",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000),
      userId: user1.id,
      alertId: alert1.id,
      incidentId: incident1.id,
    },
  });

  const notification2 = await prisma.notification.create({
    data: {
      type: "EMAIL",
      status: "SENT",
      recipient: user1.email,
      subject: "API Slow Response Alert",
      content:
        "Your API endpoint https://api.example.com is responding slowly. Average response time: 4.2s.",
      sentAt: new Date(Date.now() - 30 * 60 * 1000),
      userId: user1.id,
      alertId: alert2.id,
      incidentId: incident2.id,
    },
  });

  console.log("✅ Created notifications:", {
    notification1: notification1.subject,
    notification2: notification2.subject,
  });

  console.log("🎉 Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    throw e;
  });
