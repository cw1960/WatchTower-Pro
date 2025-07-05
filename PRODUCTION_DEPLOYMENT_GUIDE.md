# WatchTower Pro - Production Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Netlify Deployment](#netlify-deployment)
5. [Whop Integration Setup](#whop-integration-setup)
6. [Monitoring & Logging](#monitoring--logging)
7. [Performance Optimization](#performance-optimization)
8. [Security Configuration](#security-configuration)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance & Updates](#maintenance--updates)

## Prerequisites

### Required Services

- [Netlify](https://netlify.com) account for hosting
- [Supabase](https://supabase.com) account for PostgreSQL database
- [Whop](https://whop.com) developer account for platform integration
- [Sentry](https://sentry.io) account for error monitoring (recommended)
- Email service (SendGrid, Resend, or SMTP)
- Optional: Redis instance for caching

### Local Development Setup

1. **Node.js**: Version 18 or higher
2. **pnpm**: Latest version (`npm install -g pnpm`)
3. **Git**: For version control

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd WhopWatcherProject
pnpm install
```

### 2. Environment Variables

Copy the example environment file and configure:

```bash
cp env.example .env.local
```

### Required Environment Variables

#### Database Configuration

```env
DATABASE_URL="postgresql://user:password@db.supabase.co:5432/postgres"
DIRECT_URL="postgresql://user:password@db.supabase.co:5432/postgres"
```

#### Whop Integration

```env
WHOP_API_KEY="whop_xxxxx"
NEXT_PUBLIC_WHOP_APP_ID="app_xxxxx"
NEXT_PUBLIC_WHOP_AGENT_USER_ID="user_xxxxx"
NEXT_PUBLIC_WHOP_COMPANY_ID="company_xxxxx"
WHOP_STARTER_PRODUCT_ID="prod_xxxxx"
WHOP_PROFESSIONAL_PRODUCT_ID="prod_xxxxx"
WHOP_ENTERPRISE_PRODUCT_ID="prod_xxxxx"
WHOP_WEBHOOK_SECRET="whop_webhook_secret"
```

#### Application Settings

```env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.netlify.app"
NEXTAUTH_SECRET="your-32-character-secret"
JWT_SECRET="your-32-character-jwt-secret"
```

#### Error Monitoring

```env
SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
SENTRY_ORG="your-org"
SENTRY_PROJECT="watchtower-pro"
```

#### Email Service (Choose one)

```env
# SendGrid (Recommended)
SENDGRID_API_KEY="SG.xxxxx"
EMAIL_FROM="alerts@your-domain.com"

# Or SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## Database Configuration

### 1. Supabase Setup

1. Create a new Supabase project
2. Get your connection string from Settings > Database
3. Update your environment variables

### 2. Database Schema

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Optional: Seed database with example data
pnpm db:setup
```

### 3. Connection Pooling

For production, use Supabase's connection pooling:

- Use the pooled connection string for `DATABASE_URL`
- Use the direct connection string for `DIRECT_URL`

## Netlify Deployment

### 1. Connect Repository

1. Log in to Netlify
2. Click "New site from Git"
3. Connect your GitHub/GitLab repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

### 2. Environment Variables

Add all environment variables in Netlify Dashboard:

1. Go to Site settings > Environment variables
2. Add each variable from your `.env` file
3. Ensure sensitive values are properly set

### 3. Build Settings

The `netlify.toml` file is already configured with:

- Next.js optimization
- Security headers
- Caching rules
- Redirects for Whop integration

### 4. Custom Domain (Optional)

1. Go to Domain settings
2. Add your custom domain
3. Configure DNS records
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Whop Integration Setup

### 1. Whop App Configuration

1. Log in to [Whop Developer Portal](https://dev.whop.com)
2. Create a new app or configure existing
3. Set up the following:
   - **App URL**: Your Netlify domain
   - **Iframe URL**: Your Netlify domain
   - **Webhook URL**: `https://your-domain.netlify.app/api/webhooks/whop`
   - **Permissions**: Required scopes for monitoring

### 2. Product Setup

Create products for each pricing tier:

- **Starter**: $9.99/month
- **Professional**: $29.99/month
- **Enterprise**: $99.99/month

Update product IDs in environment variables.

### 3. Webhook Configuration

Webhooks are automatically handled by the `/api/webhooks/whop` endpoint for:

- Subscription created
- Subscription updated
- Subscription cancelled
- Payment completed

## Monitoring & Logging

### 1. Sentry Setup

1. Create Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Error tracking is automatically configured

### 2. Health Checks

Monitor application health:

```bash
# Check application health
curl https://your-domain.netlify.app/api/health

# Monitor database connectivity
curl https://your-domain.netlify.app/healthz
```

### 3. Log Monitoring

Logs are automatically structured and sent to:

- Console (development)
- Sentry (production)
- Database performance tracking

## Performance Optimization

### 1. Build Optimization

Already configured:

- Bundle splitting
- Tree shaking
- Image optimization
- Static asset caching

### 2. Database Optimization

- Connection pooling enabled
- Slow query monitoring
- Automatic retry logic
- Performance tracking

### 3. Caching Strategy

- Static assets: 1 year cache
- API responses: Appropriate cache headers
- Database queries: Optimized with indexing

### 4. Bundle Analysis

Analyze bundle size:

```bash
pnpm build:analyze
```

## Security Configuration

### 1. Environment Variables

- Never commit sensitive data
- Use Netlify's environment variable encryption
- Rotate secrets regularly

### 2. Content Security Policy

Configured in `netlify.toml` with:

- Script source restrictions
- Frame ancestor controls
- XSS protection

### 3. API Security

- Rate limiting implemented
- Input validation with Zod
- CORS properly configured
- Authentication middleware

### 4. Database Security

- Connection encryption
- Prepared statements (Prisma)
- Access controls

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
```

#### 2. Database Connection Issues

- Verify connection strings
- Check Supabase dashboard for issues
- Ensure IP allowlisting is configured

#### 3. Whop Integration Issues

- Verify webhook endpoint is accessible
- Check Whop app configuration
- Validate API keys and permissions

#### 4. Environment Variable Issues

- Ensure all required variables are set
- Check for typos in variable names
- Verify values are properly escaped

### Debug Mode

Enable debug mode for troubleshooting:

```env
LOG_LEVEL="debug"
ENABLE_DEBUG_MODE=true
```

### Health Check Endpoints

```bash
# Application health
GET /api/health

# Database connectivity
GET /healthz

# Ping test
HEAD /ping
```

## Maintenance & Updates

### 1. Regular Updates

```bash
# Update dependencies
pnpm update

# Update database schema
pnpm db:push

# Rebuild application
pnpm build
```

### 2. Monitoring

- Set up Netlify monitoring
- Configure Sentry alerts
- Monitor error rates and performance
- Track user metrics

### 3. Backup Strategy

- Supabase automatic backups
- Export environment configuration
- Version control for code

### 4. Scaling Considerations

- Monitor Netlify function usage
- Database connection limits
- Consider Redis for caching
- CDN for static assets

## Performance Benchmarks

### Target Metrics

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Error Rate**: < 1%
- **Uptime**: 99.9%

### Monitoring Tools

- Netlify Analytics
- Sentry Performance
- Database monitoring
- Custom metrics dashboard

## Support & Resources

### Documentation

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Netlify Docs](https://docs.netlify.com)
- [Whop Developer Docs](https://dev.whop.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Getting Help

1. Check this documentation first
2. Review application logs
3. Check Sentry for errors
4. Contact support if needed

---

## Quick Start Checklist

- [ ] Set up Supabase database
- [ ] Configure Whop app and products
- [ ] Set up Sentry project
- [ ] Clone repository and install dependencies
- [ ] Configure environment variables
- [ ] Deploy to Netlify
- [ ] Test Whop integration
- [ ] Verify monitoring and logging
- [ ] Run health checks
- [ ] Monitor performance metrics

**Deployment Time**: ~30-60 minutes for experienced developers

For questions or issues, refer to the troubleshooting section or check the application logs.
