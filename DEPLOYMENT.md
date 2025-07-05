# WatchTower Pro - Netlify Deployment Guide

## Prerequisites

✅ **Completed Setup:**

- [x] WatchTower Pro project created and configured
- [x] GitHub repository: https://github.com/cw1960/WatchTower-Pro.git
- [x] Supabase project configured
- [x] Whop app credentials configured
- [x] Netlify plugin installed (`@netlify/plugin-nextjs`)
- [x] `netlify.toml` configuration file created

## Environment Variables

### Required Environment Variables for Netlify

You'll need to add these environment variables in your Netlify dashboard:

**Database Configuration:**

```
DATABASE_URL=your_supabase_postgres_connection_string
DIRECT_URL=your_supabase_direct_connection_string
```

**Whop API Configuration:**

```
WHOP_API_KEY=your_whop_api_key
WHOP_APP_ID=your_whop_app_id
WHOP_WEBHOOK_SECRET=your_whop_webhook_secret
```

**NextAuth Configuration:**

```
NEXTAUTH_URL=https://your-netlify-domain.netlify.app
NEXTAUTH_SECRET=your_nextauth_secret_key
```

**Notification Services (Optional):**

```
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@watchtower.com

SLACK_WEBHOOK_URL=your_slack_webhook_url
DISCORD_WEBHOOK_URL=your_discord_webhook_url
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Step-by-Step Deployment

### 1. Connect Repository to Netlify

1. Go to [Netlify](https://netlify.com) and log in
2. Click "New site from Git"
3. Choose GitHub and authorize if needed
4. Select your `WatchTower-Pro` repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Functions directory:** `netlify/functions` (if using)

### 2. Configure Environment Variables

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Add all the required environment variables listed above
3. Make sure to use the production URLs and credentials

### 3. Configure Build Settings

The `netlify.toml` file should already be configured with:

- Next.js plugin enabled
- Proper redirects for SPA routing
- Security headers
- Performance optimizations

### 4. Database Setup

1. **Run Prisma migrations:**

   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Prisma client:**

   ```bash
   npx prisma generate
   ```

3. **Optional: Seed database:**
   ```bash
   npx prisma db seed
   ```

### 5. Deploy

1. Push your changes to GitHub:

   ```bash
   git add .
   git commit -m "Configure for Netlify deployment"
   git push origin main
   ```

2. Netlify will automatically detect the push and start building
3. Monitor the build process in the Netlify dashboard

## Troubleshooting Common Issues

### Build Failures

**Issue:** Build times out or fails
**Solution:**

- Check build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify database connection string is correct

**Issue:** Next.js build manifest errors
**Solution:**

- Clear build cache in Netlify (Site settings → Build & deploy → Post processing)
- Try deploying again

### Runtime Errors

**Issue:** Database connection fails
**Solution:**

- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check Supabase project is active and accessible
- Ensure IP restrictions allow Netlify's servers

**Issue:** Whop SDK errors
**Solution:**

- Verify `WHOP_API_KEY`, `WHOP_APP_ID` are correct
- Check Whop app configuration in dashboard
- Ensure webhook URL is updated to Netlify URL

### Performance Issues

**Issue:** Slow initial load
**Solution:**

- Enable Edge Functions in Netlify (if available)
- Configure proper caching headers
- Optimize images and assets

## Post-Deployment Checklist

After successful deployment:

- [ ] Test core functionality (monitoring, alerts)
- [ ] Verify Whop integration works
- [ ] Test database operations
- [ ] Check notification systems
- [ ] Update Whop app configuration with production URL
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and analytics
- [ ] Test webhook endpoints

## Updating Whop App Configuration

1. Go to your Whop Developer Dashboard
2. Navigate to your WatchTower Pro app
3. Update the **Base URL** to your Netlify URL: `https://your-site-name.netlify.app`
4. Update webhook URLs if configured
5. Test the integration

## Custom Domain Setup (Optional)

1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable with new domain
5. Update Whop app configuration with new domain

## Monitoring and Maintenance

### Netlify Analytics

- Enable Netlify Analytics for traffic insights
- Monitor build performance and failures
- Set up deploy notifications

### Application Monitoring

- Monitor API response times
- Track database performance
- Set up error tracking (e.g., Sentry)
- Monitor uptime and availability

## Support and Resources

- **Netlify Documentation:** https://docs.netlify.com/
- **Next.js on Netlify:** https://docs.netlify.com/frameworks/next-js/
- **Whop Documentation:** https://docs.whop.com/
- **Project Repository:** https://github.com/cw1960/WatchTower-Pro

## Security Considerations

1. **Environment Variables:** Never commit sensitive data to Git
2. **API Keys:** Rotate API keys regularly
3. **Database:** Use connection pooling and proper access controls
4. **HTTPS:** Ensure all communications use HTTPS
5. **CORS:** Configure proper CORS settings for API endpoints

---

**Note:** This project is configured for Netlify deployment with the Next.js plugin. The build process should handle most configurations automatically, but refer to this guide for any deployment issues.
