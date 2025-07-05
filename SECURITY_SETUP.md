# 🔐 CRITICAL SECURITY SETUP - WatchTower Pro

## ⚠️ IMMEDIATE ACTION REQUIRED

Your database currently has **RLS (Row Level Security) DISABLED** which is a **CRITICAL SECURITY VULNERABILITY**.

**This means ANY user can access ALL data in your database!**

## 🚨 Apply RLS Policies Immediately

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your WatchTower Pro project
3. Navigate to **SQL Editor** in the sidebar

### Step 2: Apply RLS Policies
1. Copy the **entire contents** of `prisma/enable-rls-fixed.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute all policies

### Step 3: Verify Security
The script will automatically show verification results:
- All tables should show `rowsecurity = true`
- All policies should be created successfully

## 🔒 What These Policies Do

### Security Model:
- **Users can only access their own data**
- **Company members can access shared company data**
- **Admins can manage company resources**
- **Service role has full access for server operations**

### Protected Resources:
- ✅ User profiles and settings
- ✅ Company data and memberships
- ✅ Monitors and monitoring data
- ✅ Alerts and notifications
- ✅ Incidents and check results

## 🛡️ After Applying RLS

### What Changes:
- **Users can only see their own data**
- **Multi-tenant isolation is enforced**
- **Company data is properly scoped**
- **No cross-tenant data access**

### Application Impact:
- **Your app will continue to work normally**
- **Server-side operations use service role**
- **Client-side queries are automatically secured**
- **No code changes needed**

## 📋 Verification Commands

After applying, run these in SQL Editor to verify:

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'companies', 'company_users', 'monitors', 'monitor_checks', 'alerts', 'incidents', 'notifications')
AND schemaname = 'public';

-- Should show rowsecurity = true for all tables
```

## 🔧 If Something Goes Wrong

If the app breaks after applying RLS:
1. Check that your `DATABASE_URL` uses the **service role key** (not anon key)
2. Verify environment variables are properly set
3. Check server logs for RLS policy violations

## 🚀 Next Steps

After applying RLS:
1. ✅ Your database is now secure
2. ✅ Multi-tenant isolation is enforced
3. ✅ Ready for production use
4. ✅ GDPR/compliance requirements met

---

**⚠️ DO NOT SKIP THIS STEP - Apply RLS policies immediately to secure your database!** 