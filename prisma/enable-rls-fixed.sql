-- ==========================================
-- WATCHTOWER PRO - ROW LEVEL SECURITY SETUP
-- ==========================================
-- This file enables RLS and creates secure policies
-- Run this in your Supabase SQL editor to secure the database

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Service role has full access" ON users;

DROP POLICY IF EXISTS "Users can view companies they belong to" ON companies;
DROP POLICY IF EXISTS "Users can update companies they admin" ON companies;
DROP POLICY IF EXISTS "Service role has full access" ON companies;

DROP POLICY IF EXISTS "Users can view company memberships" ON company_users;
DROP POLICY IF EXISTS "Users can manage company memberships" ON company_users;
DROP POLICY IF EXISTS "Service role has full access" ON company_users;

DROP POLICY IF EXISTS "Users can view their own monitors" ON monitors;
DROP POLICY IF EXISTS "Users can manage their own monitors" ON monitors;
DROP POLICY IF EXISTS "Service role has full access" ON monitors;

DROP POLICY IF EXISTS "Users can view their monitor checks" ON monitor_checks;
DROP POLICY IF EXISTS "Service role has full access" ON monitor_checks;

DROP POLICY IF EXISTS "Users can view their own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can manage their own alerts" ON alerts;
DROP POLICY IF EXISTS "Service role has full access" ON alerts;

DROP POLICY IF EXISTS "Users can view their incidents" ON incidents;
DROP POLICY IF EXISTS "Users can manage their incidents" ON incidents;
DROP POLICY IF EXISTS "Service role has full access" ON incidents;

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage their notifications" ON notifications;
DROP POLICY IF EXISTS "Service role has full access" ON notifications;

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Users can view their own data
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT 
    USING (auth.uid()::text = id OR auth.uid()::text = "whopId");

-- Users can update their own data
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE 
    USING (auth.uid()::text = id OR auth.uid()::text = "whopId");

-- Service role has full access (for server-side operations)
CREATE POLICY "Service role has full access" ON users
    FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- COMPANIES TABLE POLICIES
-- ==========================================

-- Users can view companies they belong to
CREATE POLICY "Users can view companies they belong to" ON companies
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users."companyId" = companies.id 
            AND (company_users."userId" = auth.uid()::text OR 
                 EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
        )
    );

-- Users can update companies they admin
CREATE POLICY "Users can update companies they admin" ON companies
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users."companyId" = companies.id 
            AND company_users.role = 'ADMIN'
            AND (company_users."userId" = auth.uid()::text OR 
                 EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access" ON companies
    FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- COMPANY_USERS TABLE POLICIES
-- ==========================================

-- Users can view company memberships they're part of
CREATE POLICY "Users can view company memberships" ON company_users
    FOR SELECT 
    USING (
        "userId" = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = "userId" AND users."whopId" = auth.uid()::text) OR
        EXISTS (
            SELECT 1 FROM company_users cu2 
            WHERE cu2."companyId" = company_users."companyId" 
            AND (cu2."userId" = auth.uid()::text OR 
                 EXISTS (SELECT 1 FROM users WHERE users.id = cu2."userId" AND users."whopId" = auth.uid()::text))
        )
    );

-- Users can manage company memberships if they're admin
CREATE POLICY "Users can manage company memberships" ON company_users
    FOR ALL 
    USING (
        "userId" = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = "userId" AND users."whopId" = auth.uid()::text) OR
        EXISTS (
            SELECT 1 FROM company_users cu2 
            WHERE cu2."companyId" = company_users."companyId" 
            AND cu2.role = 'ADMIN'
            AND (cu2."userId" = auth.uid()::text OR 
                 EXISTS (SELECT 1 FROM users WHERE users.id = cu2."userId" AND users."whopId" = auth.uid()::text))
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access" ON company_users
    FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- MONITORS TABLE POLICIES
-- ==========================================

-- Users can view their own monitors or company monitors they have access to
CREATE POLICY "Users can view their own monitors" ON monitors
    FOR SELECT 
    USING (
        "userId" = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = "userId" AND users."whopId" = auth.uid()::text) OR
        (
            "companyId" IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM company_users 
                WHERE company_users."companyId" = monitors."companyId" 
                AND (company_users."userId" = auth.uid()::text OR 
                     EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
            )
        )
    );

-- Users can manage their own monitors or company monitors they have access to
CREATE POLICY "Users can manage their own monitors" ON monitors
    FOR ALL 
    USING (
        "userId" = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = "userId" AND users."whopId" = auth.uid()::text) OR
        (
            "companyId" IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM company_users 
                WHERE company_users."companyId" = monitors."companyId" 
                AND (company_users."userId" = auth.uid()::text OR 
                     EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
            )
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access" ON monitors
    FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- MONITOR_CHECKS TABLE POLICIES
-- ==========================================

-- Users can view checks for monitors they have access to
CREATE POLICY "Users can view their monitor checks" ON monitor_checks
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM monitors 
            WHERE monitors.id = monitor_checks."monitorId" 
            AND (
                monitors."userId" = auth.uid()::text OR 
                EXISTS (SELECT 1 FROM users WHERE users.id = monitors."userId" AND users."whopId" = auth.uid()::text) OR
                (
                    monitors."companyId" IS NOT NULL AND
                    EXISTS (
                        SELECT 1 FROM company_users 
                        WHERE company_users."companyId" = monitors."companyId" 
                        AND (company_users."userId" = auth.uid()::text OR 
                             EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
                    )
                )
            )
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access" ON monitor_checks
    FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- ALERTS TABLE POLICIES
-- ==========================================

-- Users can view their own alerts
CREATE POLICY "Users can view their own alerts" ON alerts
    FOR SELECT 
    USING (
        "userId" = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = "userId" AND users."whopId" = auth.uid()::text) OR
        (
            "companyId" IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM company_users 
                WHERE company_users."companyId" = alerts."companyId" 
                AND (company_users."userId" = auth.uid()::text OR 
                     EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
            )
        )
    );

-- Users can manage their own alerts
CREATE POLICY "Users can manage their own alerts" ON alerts
    FOR ALL 
    USING (
        "userId" = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = "userId" AND users."whopId" = auth.uid()::text) OR
        (
            "companyId" IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM company_users 
                WHERE company_users."companyId" = alerts."companyId" 
                AND (company_users."userId" = auth.uid()::text OR 
                     EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
            )
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access" ON alerts
    FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- INCIDENTS TABLE POLICIES
-- ==========================================

-- Users can view incidents for monitors/alerts they have access to
CREATE POLICY "Users can view their incidents" ON incidents
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM monitors 
            WHERE monitors.id = incidents."monitorId" 
            AND (
                monitors."userId" = auth.uid()::text OR 
                EXISTS (SELECT 1 FROM users WHERE users.id = monitors."userId" AND users."whopId" = auth.uid()::text) OR
                (
                    monitors."companyId" IS NOT NULL AND
                    EXISTS (
                        SELECT 1 FROM company_users 
                        WHERE company_users."companyId" = monitors."companyId" 
                        AND (company_users."userId" = auth.uid()::text OR 
                             EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
                    )
                )
            )
        )
    );

-- Users can manage incidents for monitors/alerts they have access to
CREATE POLICY "Users can manage their incidents" ON incidents
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM monitors 
            WHERE monitors.id = incidents."monitorId" 
            AND (
                monitors."userId" = auth.uid()::text OR 
                EXISTS (SELECT 1 FROM users WHERE users.id = monitors."userId" AND users."whopId" = auth.uid()::text) OR
                (
                    monitors."companyId" IS NOT NULL AND
                    EXISTS (
                        SELECT 1 FROM company_users 
                        WHERE company_users."companyId" = monitors."companyId" 
                        AND (company_users."userId" = auth.uid()::text OR 
                             EXISTS (SELECT 1 FROM users WHERE users.id = company_users."userId" AND users."whopId" = auth.uid()::text))
                    )
                )
            )
        )
    );

-- Service role has full access
CREATE POLICY "Service role has full access" ON incidents
    FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- NOTIFICATIONS TABLE POLICIES
-- ==========================================

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT 
    USING (
        "userId" = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = "userId" AND users."whopId" = auth.uid()::text)
    );

-- Users can manage their own notifications
CREATE POLICY "Users can manage their notifications" ON notifications
    FOR ALL 
    USING (
        "userId" = auth.uid()::text OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = "userId" AND users."whopId" = auth.uid()::text)
    );

-- Service role has full access
CREATE POLICY "Service role has full access" ON notifications
    FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- VERIFY SETUP
-- ==========================================

-- Check that RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'companies', 'company_users', 'monitors', 'monitor_checks', 'alerts', 'incidents', 'notifications')
AND schemaname = 'public';

-- List all policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'companies', 'company_users', 'monitors', 'monitor_checks', 'alerts', 'incidents', 'notifications')
AND schemaname = 'public'
ORDER BY tablename, policyname; 