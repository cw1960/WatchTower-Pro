# WatchTower Pro - Operations Guide

## Overview

This guide covers day-to-day operations, monitoring, maintenance, and troubleshooting for WatchTower Pro in production.

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Monitoring & Alerting](#monitoring--alerting)
3. [Performance Monitoring](#performance-monitoring)
4. [Error Handling & Debugging](#error-handling--debugging)
5. [Database Maintenance](#database-maintenance)
6. [Security Operations](#security-operations)
7. [Backup & Recovery](#backup--recovery)
8. [Scaling Operations](#scaling-operations)
9. [Incident Response](#incident-response)
10. [Maintenance Procedures](#maintenance-procedures)

## Daily Operations

### Health Check Routine

Perform these checks daily:

```bash
# Application health
curl -f https://your-domain.netlify.app/api/health

# Database connectivity
curl -f https://your-domain.netlify.app/healthz

# Whop webhook endpoint
curl -f https://your-domain.netlify.app/api/webhooks/whop
```

### Key Metrics to Monitor

- **Response times**: < 500ms for API endpoints
- **Error rates**: < 1% overall
- **Database connections**: Monitor pool usage
- **Memory usage**: Monitor for leaks
- **Active users**: Track daily/monthly active users
- **Monitor success rate**: Uptime monitoring effectiveness

### Dashboard Checks

1. **Netlify Dashboard**
   - Build status
   - Function invocations
   - Error rates
   - Performance metrics

2. **Sentry Dashboard**
   - Error frequency
   - Performance issues
   - User feedback
   - Release adoption

3. **Supabase Dashboard**
   - Database performance
   - Connection usage
   - Query performance
   - Storage usage

## Monitoring & Alerting

### Sentry Configuration

Key alerts to configure:

```javascript
// Error rate threshold
if (error_rate > 5%) {
  alert('High error rate detected');
}

// Performance degradation
if (response_time > 1000ms) {
  alert('Performance degradation');
}

// Database issues
if (database_errors > 10) {
  alert('Database connectivity issues');
}
```

### Custom Monitoring Scripts

#### Health Check Script

```bash
#!/bin/bash
# health-check.sh

DOMAIN="your-domain.netlify.app"
ENDPOINTS=("/api/health" "/healthz" "/api/auth/me")

for endpoint in "${ENDPOINTS[@]}"; do
  echo "Checking $endpoint..."
  if curl -f "https://$DOMAIN$endpoint" > /dev/null 2>&1; then
    echo "✓ $endpoint is healthy"
  else
    echo "✗ $endpoint is down"
    # Send alert (integrate with your alerting system)
  fi
done
```

#### Performance Monitoring

```bash
#!/bin/bash
# performance-check.sh

DOMAIN="your-domain.netlify.app"

# Check page load time
LOAD_TIME=$(curl -o /dev/null -s -w '%{time_total}' "https://$DOMAIN")
echo "Page load time: ${LOAD_TIME}s"

if (( $(echo "$LOAD_TIME > 2.0" | bc -l) )); then
  echo "Warning: Slow page load time"
fi
```

### Alerting Thresholds

- **Error Rate**: > 5% over 5 minutes
- **Response Time**: > 2 seconds average over 5 minutes
- **Database Errors**: > 10 errors in 1 minute
- **Memory Usage**: > 80% for 10 minutes
- **Failed Deployments**: Any failed build
- **Security Events**: Any high-severity security alert

## Performance Monitoring

### Key Performance Indicators (KPIs)

1. **Application Performance**
   - Page load time: < 2 seconds
   - API response time: < 500ms
   - Time to first byte: < 200ms
   - Largest contentful paint: < 2.5 seconds

2. **Database Performance**
   - Query execution time: < 100ms average
   - Connection pool usage: < 80%
   - Slow query count: < 10 per hour
   - Database CPU usage: < 70%

3. **Business Metrics**
   - Monitor creation rate
   - Alert accuracy rate
   - User engagement metrics
   - Subscription conversion rate

### Performance Optimization Actions

#### When Response Time > 1s

1. Check database query performance
2. Review slow query logs
3. Analyze bundle size
4. Check third-party API response times
5. Monitor CDN performance

#### When Error Rate > 3%

1. Check Sentry for error patterns
2. Review recent deployments
3. Check database connectivity
4. Verify third-party service status
5. Analyze error logs

## Error Handling & Debugging

### Error Classification

1. **Critical Errors** (P0)
   - Application down
   - Database connectivity loss
   - Payment processing failures
   - Security breaches

2. **High Priority Errors** (P1)
   - Feature completely broken
   - Data loss
   - Performance degradation > 50%
   - Authentication failures

3. **Medium Priority Errors** (P2)
   - Feature partially broken
   - UI/UX issues
   - Minor performance issues
   - Non-critical API failures

4. **Low Priority Errors** (P3)
   - Cosmetic issues
   - Enhancement requests
   - Documentation errors

### Debugging Workflow

1. **Identify**: Check monitoring dashboards
2. **Classify**: Determine error severity
3. **Investigate**: Review logs and metrics
4. **Reproduce**: Replicate the issue
5. **Fix**: Implement solution
6. **Verify**: Test the fix
7. **Deploy**: Release to production
8. **Monitor**: Ensure issue is resolved

### Common Error Patterns

#### Database Connection Errors

```bash
# Check connection pool status
echo "SELECT count(*) FROM pg_stat_activity;" | psql $DATABASE_URL

# Monitor active connections
watch -n 5 "echo 'SELECT count(*) FROM pg_stat_activity;' | psql $DATABASE_URL"
```

#### Memory Leaks

```bash
# Monitor memory usage
watch -n 10 "curl -s https://your-domain.netlify.app/api/health | jq '.system.memory'"
```

#### Rate Limiting Issues

```bash
# Check rate limit headers
curl -I https://your-domain.netlify.app/api/monitors
```

## Database Maintenance

### Daily Tasks

```bash
# Check database size
echo "SELECT pg_size_pretty(pg_database_size('postgres'));" | psql $DATABASE_URL

# Monitor active connections
echo "SELECT count(*) FROM pg_stat_activity;" | psql $DATABASE_URL

# Check for long-running queries
echo "SELECT pid, query, state, query_start FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';" | psql $DATABASE_URL
```

### Weekly Tasks

```bash
# Analyze table statistics
echo "ANALYZE;" | psql $DATABASE_URL

# Check index usage
echo "SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes ORDER BY idx_tup_read DESC;" | psql $DATABASE_URL

# Review slow queries
# Check Supabase dashboard for slow query logs
```

### Monthly Tasks

```bash
# Vacuum tables
echo "VACUUM ANALYZE;" | psql $DATABASE_URL

# Review database performance
# Check query performance trends
# Review index effectiveness
# Plan for storage optimization
```

### Database Backup Verification

```bash
# Verify backup schedule
# Test backup restoration process
# Check backup integrity
# Review retention policies
```

## Security Operations

### Daily Security Checks

1. **Access Logs Review**
   - Unusual login patterns
   - Failed authentication attempts
   - Suspicious IP addresses
   - Unusual API usage

2. **Security Headers Verification**

```bash
curl -I https://your-domain.netlify.app | grep -E "(X-Frame-Options|Content-Security-Policy|X-Content-Type-Options)"
```

3. **SSL Certificate Status**

```bash
echo | openssl s_client -servername your-domain.netlify.app -connect your-domain.netlify.app:443 2>/dev/null | openssl x509 -noout -dates
```

### Security Incident Response

1. **Identify**: Detect security event
2. **Contain**: Limit potential damage
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operations
5. **Learn**: Document and improve

### Security Monitoring

- Failed login attempts: > 10 in 5 minutes
- Unusual API access patterns
- Database access anomalies
- File system changes
- Network intrusion attempts

## Backup & Recovery

### Backup Strategy

1. **Database Backups**
   - Automated daily backups (Supabase)
   - Weekly full backups
   - Monthly archive backups
   - Point-in-time recovery capability

2. **Code Backups**
   - Git repository (primary)
   - Netlify deployment artifacts
   - Environment configurations

3. **Configuration Backups**
   - Environment variables
   - Build configurations
   - DNS settings
   - SSL certificates

### Recovery Procedures

#### Database Recovery

```bash
# Point-in-time recovery
# Follow Supabase documentation for specific procedures

# Verify data integrity after recovery
echo "SELECT count(*) FROM monitors;" | psql $DATABASE_URL
echo "SELECT count(*) FROM users;" | psql $DATABASE_URL
```

#### Application Recovery

```bash
# Redeploy from Git
# Restore environment variables
# Verify application functionality
# Run health checks
```

### Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: 1 hour
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Communication Plan**: Defined stakeholder notifications
4. **Fallback Procedures**: Documented step-by-step recovery

## Scaling Operations

### Performance Thresholds for Scaling

- **Database**: > 70% CPU for 30 minutes
- **Memory**: > 80% usage for 15 minutes
- **API Requests**: > 80% of rate limits
- **Storage**: > 80% capacity

### Scaling Actions

1. **Database Scaling**
   - Increase Supabase compute size
   - Add read replicas
   - Implement connection pooling
   - Optimize queries

2. **Application Scaling**
   - Netlify automatic scaling
   - Function timeout optimization
   - CDN optimization
   - Bundle size reduction

### Capacity Planning

- Monitor growth trends
- Project resource needs
- Plan scaling timelines
- Budget for increased capacity

## Incident Response

### Incident Severity Levels

- **SEV1**: Service completely down
- **SEV2**: Major feature broken
- **SEV3**: Minor feature impacted
- **SEV4**: Non-functional issue

### Response Procedures

#### SEV1 Response (< 15 minutes)

1. Acknowledge incident
2. Assess impact
3. Implement immediate fix or rollback
4. Communicate status
5. Monitor resolution

#### SEV2 Response (< 1 hour)

1. Investigate root cause
2. Implement fix
3. Test thoroughly
4. Deploy solution
5. Post-incident review

### Communication Templates

#### Status Page Update

```
[INVESTIGATING] We're currently investigating reports of slow response times on the monitoring dashboard. We'll provide updates as we learn more.

[IDENTIFIED] We've identified the cause as a database performance issue and are working on a resolution.

[RESOLVED] The issue has been resolved. All services are operating normally.
```

## Maintenance Procedures

### Scheduled Maintenance

#### Weekly Maintenance (Low-traffic periods)

```bash
# Update dependencies
pnpm update

# Run security audit
pnpm audit

# Check for outdated packages
pnpm outdated

# Review performance metrics
```

#### Monthly Maintenance

```bash
# Database maintenance
echo "VACUUM ANALYZE;" | psql $DATABASE_URL

# Security review
# Performance optimization
# Capacity planning review
```

#### Quarterly Maintenance

```bash
# Major dependency updates
# Security penetration testing
# Disaster recovery testing
# Business continuity review
```

### Maintenance Windows

- **Weekly**: Sunday 2-4 AM UTC
- **Monthly**: First Sunday 2-6 AM UTC
- **Emergency**: As needed with 2-hour notice

### Pre-Maintenance Checklist

- [ ] Schedule maintenance window
- [ ] Notify stakeholders
- [ ] Prepare rollback plan
- [ ] Backup critical data
- [ ] Test in staging environment
- [ ] Update monitoring dashboards

### Post-Maintenance Checklist

- [ ] Verify all services operational
- [ ] Run comprehensive health checks
- [ ] Monitor error rates
- [ ] Update documentation
- [ ] Communicate completion

## Emergency Contacts

### Escalation Path

1. **On-call Engineer**: Primary contact
2. **Technical Lead**: Secondary contact
3. **Engineering Manager**: Escalation
4. **CTO**: Executive escalation

### Service Contacts

- **Netlify Support**: [support link]
- **Supabase Support**: [support link]
- **Whop Support**: [support link]
- **Sentry Support**: [support link]

---

## Operations Calendar

### Daily (Business Days)

- Health check review
- Error rate monitoring
- Performance metrics review

### Weekly

- Security audit
- Performance optimization
- Dependency updates

### Monthly

- Database maintenance
- Capacity planning review
- Security review

### Quarterly

- Disaster recovery testing
- Major updates
- Business continuity review

This operations guide should be reviewed and updated quarterly to ensure it remains current with system changes and operational learnings.
