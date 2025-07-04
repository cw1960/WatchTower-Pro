-- WatchTower Pro Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE "PlanType" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE "CompanyUserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "MonitorType" AS ENUM ('HTTP', 'HTTPS', 'PING', 'TCP', 'WHOP_METRICS', 'WHOP_SALES', 'WHOP_USERS', 'WHOP_REVENUE');
CREATE TYPE "MonitorStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');
CREATE TYPE "CheckStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'ERROR');
CREATE TYPE "AlertType" AS ENUM ('DOWN', 'UP', 'SLOW_RESPONSE', 'SSL_EXPIRY', 'KEYWORD_MISSING', 'KEYWORD_FOUND', 'STATUS_CODE', 'WHOP_THRESHOLD', 'WHOP_ANOMALY');
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');
CREATE TYPE "AlertChannel" AS ENUM ('EMAIL', 'SLACK', 'DISCORD', 'WEBHOOK', 'SMS', 'PUSH');
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SLACK', 'DISCORD', 'WEBHOOK', 'SMS', 'PUSH');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- Create Tables

-- Users Table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "whopId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "companyId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Companies Table
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "whopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "subscriptionId" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- Company Users Table (Junction Table)
CREATE TABLE "company_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "CompanyUserRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "company_users_pkey" PRIMARY KEY ("id")
);

-- Monitors Table
CREATE TABLE "monitors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MonitorType" NOT NULL DEFAULT 'HTTP',
    "status" "MonitorStatus" NOT NULL DEFAULT 'ACTIVE',
    "interval" INTEGER NOT NULL DEFAULT 300,
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "retries" INTEGER NOT NULL DEFAULT 3,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "headers" JSONB,
    "body" TEXT,
    "expectedStatus" INTEGER DEFAULT 200,
    "expectedContent" TEXT,
    "expectedKeywords" TEXT[],
    "sslCheck" BOOLEAN NOT NULL DEFAULT false,
    "sslExpiryDays" INTEGER DEFAULT 30,
    "responseTimeThreshold" INTEGER DEFAULT 5000,
    "whopMetrics" JSONB,
    "whopThresholds" JSONB,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "lastCheck" TIMESTAMPTZ,

    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

-- Monitor Checks Table
CREATE TABLE "monitor_checks" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'PENDING',
    "responseTime" INTEGER,
    "statusCode" INTEGER,
    "responseSize" INTEGER,
    "responseHeaders" JSONB,
    "sslExpiryDate" TIMESTAMPTZ,
    "sslIssuer" TEXT,
    "errorMessage" TEXT,
    "errorType" TEXT,
    "whopData" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "checkedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "monitor_checks_pkey" PRIMARY KEY ("id")
);

-- Alerts Table
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AlertType" NOT NULL DEFAULT 'DOWN',
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "conditions" JSONB NOT NULL,
    "threshold" DOUBLE PRECISION,
    "duration" INTEGER DEFAULT 300,
    "channels" "AlertChannel"[],
    "escalation" JSONB,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "monitorId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- Incidents Table
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "triggeredBy" JSONB,
    "resolvedBy" JSONB,
    "monitorId" TEXT NOT NULL,
    "alertId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "resolvedAt" TIMESTAMPTZ,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- Notifications Table
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'EMAIL',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "sentAt" TIMESTAMPTZ,
    "deliveredAt" TIMESTAMPTZ,
    "errorMessage" TEXT,
    "userId" TEXT NOT NULL,
    "alertId" TEXT,
    "incidentId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Create Unique Constraints
CREATE UNIQUE INDEX "users_whopId_key" ON "users"("whopId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "companies_whopId_key" ON "companies"("whopId");
CREATE UNIQUE INDEX "company_users_userId_companyId_key" ON "company_users"("userId", "companyId");

-- Create Indexes for Performance
CREATE INDEX "monitors_userId_idx" ON "monitors"("userId");
CREATE INDEX "monitors_companyId_idx" ON "monitors"("companyId");
CREATE INDEX "monitors_status_idx" ON "monitors"("status");
CREATE INDEX "monitors_type_idx" ON "monitors"("type");
CREATE INDEX "monitor_checks_monitorId_idx" ON "monitor_checks"("monitorId");
CREATE INDEX "monitor_checks_status_idx" ON "monitor_checks"("status");
CREATE INDEX "monitor_checks_checkedAt_idx" ON "monitor_checks"("checkedAt");
CREATE INDEX "alerts_userId_idx" ON "alerts"("userId");
CREATE INDEX "alerts_monitorId_idx" ON "alerts"("monitorId");
CREATE INDEX "alerts_status_idx" ON "alerts"("status");
CREATE INDEX "incidents_monitorId_idx" ON "incidents"("monitorId");
CREATE INDEX "incidents_alertId_idx" ON "incidents"("alertId");
CREATE INDEX "incidents_status_idx" ON "incidents"("status");
CREATE INDEX "incidents_severity_idx" ON "incidents"("severity");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_alertId_idx" ON "notifications"("alertId");
CREATE INDEX "notifications_incidentId_idx" ON "notifications"("incidentId");
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- Add Foreign Key Constraints

-- Company Users
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Monitors
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Monitor Checks
ALTER TABLE "monitor_checks" ADD CONSTRAINT "monitor_checks_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Alerts
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Incidents
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Notifications
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Functions for Updated At Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for Updated At Timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON "companies" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_users_updated_at BEFORE UPDATE ON "company_users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON "monitors" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON "alerts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON "incidents" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON "notifications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Some Sample Data (Optional)
-- Uncomment the following section if you want sample data

/*
-- Sample User
INSERT INTO "users" ("id", "whopId", "email", "name", "plan") VALUES
('user_sample_001', 'whop_user_001', 'demo@watchtower.com', 'Demo User', 'PROFESSIONAL');

-- Sample Company
INSERT INTO "companies" ("id", "whopId", "name", "plan") VALUES
('company_sample_001', 'whop_company_001', 'Demo Company', 'PROFESSIONAL');

-- Sample Company User Relationship
INSERT INTO "company_users" ("id", "userId", "companyId", "role") VALUES
('cu_sample_001', 'user_sample_001', 'company_sample_001', 'OWNER');

-- Sample Monitor
INSERT INTO "monitors" ("id", "name", "url", "type", "userId", "companyId", "interval") VALUES
('monitor_sample_001', 'Demo Website Monitor', 'https://example.com', 'HTTPS', 'user_sample_001', 'company_sample_001', 300);

-- Sample Alert
INSERT INTO "alerts" ("id", "name", "type", "conditions", "userId", "companyId", "monitorId", "channels") VALUES
('alert_sample_001', 'Website Down Alert', 'DOWN', '{"field": "status_code", "operator": "not_equals", "value": 200}', 'user_sample_001', 'company_sample_001', 'monitor_sample_001', '{"EMAIL", "SLACK"}');
*/

-- Create RLS (Row Level Security) Policies for Supabase
-- Uncomment if you want to enable RLS

/*
-- Enable RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "company_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "monitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "monitor_checks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alerts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "incidents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON "users" FOR SELECT USING (auth.uid()::text = "whopId");
CREATE POLICY "Users can update own data" ON "users" FOR UPDATE USING (auth.uid()::text = "whopId");

-- Similar policies would be needed for other tables based on your auth strategy
*/

-- Verification Queries
-- Run these after the schema creation to verify everything worked

SELECT 'Schema created successfully!' as status;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'companies', 'monitors', 'monitor_checks', 'alerts', 'incidents', 'notifications')
ORDER BY table_name, ordinal_position;

SELECT 
    'Tables created: ' || COUNT(*) as summary
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'companies', 'company_users', 'monitors', 'monitor_checks', 'alerts', 'incidents', 'notifications'); 