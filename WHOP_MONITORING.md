# Whop-Native Monitoring Features

WatchTower Pro now supports comprehensive monitoring of your Whop business metrics directly through the Whop API. This allows you to track membership growth, revenue changes, community engagement, and access pass performance in real-time.

## Features

### 1. Membership Count Monitoring
Track membership changes for your experiences:
- Total member count
- Active member count
- New members (daily, weekly, monthly)
- Churn rate calculation
- Members by product breakdown
- Members by status (active/inactive)

### 2. Sales & Revenue Metrics
Monitor your business performance:
- Total balance in your Whop ledger
- Pending balance
- Revenue trends (daily, weekly, monthly)
- Average order value
- Transaction count
- Revenue by product

### 3. Community Activity Metrics
Track engagement in your community:
- Total conversations
- Active conversations
- Message volume
- Response time analytics
- Most active users
- Engagement rate

### 4. Access Pass Performance
Monitor your access pass metrics:
- Active user count
- Review averages
- Waitlist size
- Gallery image count
- Conversion rates
- Visibility status

## API Endpoints

### Create a Whop Monitor

```bash
POST /api/whop-monitors
```

**Request Body:**
```json
{
  "type": "membership|revenue|community|access-pass|comprehensive",
  "companyId": "biz_XXXXXXXX",
  "name": "My Monitor Name",
  "interval": 15,
  "userId": "user_XXXXXXXX",
  "accessPassId": "prod_XXXXXXXX",
  "experienceId": "exp_XXXXXXXX",
  "alerts": [
    {
      "name": "Low Membership Alert",
      "type": "DOWN",
      "conditions": {
        "operator": "LESS_THAN",
        "value": 100,
        "field": "active_members"
      },
      "channels": ["EMAIL"],
      "enabled": true
    }
  ]
}
```

### Get Whop Monitors

```bash
GET /api/whop-monitors?companyId=biz_XXXXXXXX&type=membership
```

### Update a Whop Monitor

```bash
PUT /api/whop-monitors
```

**Request Body:**
```json
{
  "id": "monitor_id",
  "name": "Updated Monitor Name",
  "interval": 30
}
```

### Delete a Whop Monitor

```bash
DELETE /api/whop-monitors?id=monitor_id
```

## Monitor Types

### 1. Membership Monitor
```json
{
  "type": "membership",
  "companyId": "biz_XXXXXXXX",
  "name": "Member Growth Tracker",
  "interval": 60,
  "userId": "user_XXXXXXXX",
  "experienceId": "exp_XXXXXXXX"
}
```

### 2. Revenue Monitor
```json
{
  "type": "revenue",
  "companyId": "biz_XXXXXXXX",
  "name": "Revenue Tracker",
  "interval": 30,
  "userId": "user_XXXXXXXX"
}
```

### 3. Community Monitor
```json
{
  "type": "community",
  "companyId": "biz_XXXXXXXX",
  "name": "Community Engagement",
  "interval": 120,
  "userId": "user_XXXXXXXX"
}
```

### 4. Access Pass Monitor
```json
{
  "type": "access-pass",
  "companyId": "biz_XXXXXXXX",
  "accessPassId": "prod_XXXXXXXX",
  "name": "Access Pass Performance",
  "interval": 45,
  "userId": "user_XXXXXXXX"
}
```

### 5. Comprehensive Monitor
```json
{
  "type": "comprehensive",
  "companyId": "biz_XXXXXXXX",
  "name": "Full Whop Metrics",
  "interval": 60,
  "userId": "user_XXXXXXXX",
  "accessPassId": "prod_XXXXXXXX"
}
```

## Alert Conditions

### Membership Alerts
- `total_members` - Total member count
- `active_members` - Active member count
- `new_members_today` - New members today
- `new_members_week` - New members this week
- `new_members_month` - New members this month
- `churn_rate` - Churn rate percentage

### Revenue Alerts
- `total_balance` - Total balance in ledger
- `pending_balance` - Pending balance
- `daily_revenue` - Daily revenue
- `weekly_revenue` - Weekly revenue
- `monthly_revenue` - Monthly revenue

### Community Alerts
- `total_conversations` - Total conversations
- `active_conversations` - Active conversations
- `engagement_rate` - Engagement rate percentage

### Access Pass Alerts
- `active_users` - Active users count
- `reviews_average` - Average review rating
- `waitlist_count` - Waitlist size

## Example Alert Configurations

### Membership Drop Alert
```json
{
  "name": "Membership Drop Alert",
  "type": "DOWN",
  "conditions": {
    "operator": "DECREASED_BY",
    "value": 10,
    "field": "active_members",
    "percentage": true
  },
  "channels": ["EMAIL", "SLACK"],
  "enabled": true
}
```

### Revenue Threshold Alert
```json
{
  "name": "Revenue Milestone",
  "type": "UP",
  "conditions": {
    "operator": "GREATER_THAN",
    "value": 10000,
    "field": "total_balance"
  },
  "channels": ["EMAIL"],
  "enabled": true
}
```

### Community Engagement Alert
```json
{
  "name": "Low Engagement Alert",
  "type": "DOWN",
  "conditions": {
    "operator": "LESS_THAN",
    "value": 50,
    "field": "engagement_rate"
  },
  "channels": ["SLACK"],
  "enabled": true
}
```

## Integration with Existing Monitoring

The Whop-native monitoring features work seamlessly alongside your existing website monitoring:

1. **Unified Dashboard**: All monitors (web scraping and Whop) appear in the same dashboard
2. **Consistent Alerting**: Use the same alert configuration system for both monitor types
3. **Combined Analytics**: View web performance and business metrics side by side
4. **Single API**: Manage all monitors through the same API endpoints

## Usage Examples

### JavaScript/TypeScript
```typescript
// Create a comprehensive Whop monitor
const monitor = await fetch('/api/whop-monitors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'comprehensive',
    companyId: 'biz_XXXXXXXX',
    name: 'Complete Business Metrics',
    interval: 60,
    userId: 'user_XXXXXXXX',
    accessPassId: 'prod_XXXXXXXX',
    alerts: [
      {
        name: 'Revenue Drop Alert',
        type: 'DOWN',
        conditions: {
          operator: 'DECREASED_BY',
          value: 15,
          field: 'total_balance',
          percentage: true
        },
        channels: ['EMAIL', 'SLACK'],
        enabled: true
      }
    ]
  })
});

const result = await monitor.json();
console.log('Monitor created:', result.monitor);
```

### cURL
```bash
# Create a membership monitor
curl -X POST http://localhost:3000/api/whop-monitors \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership",
    "companyId": "biz_XXXXXXXX",
    "name": "Member Growth Tracker",
    "interval": 60,
    "userId": "user_XXXXXXXX",
    "experienceId": "exp_XXXXXXXX"
  }'
```

## Best Practices

1. **Monitor Intervals**: 
   - Revenue: 30-60 minutes
   - Membership: 60-120 minutes
   - Community: 120-240 minutes
   - Access Pass: 45-90 minutes

2. **Alert Thresholds**:
   - Set realistic thresholds based on your business size
   - Use percentage-based alerts for growth metrics
   - Configure escalation for critical business metrics

3. **Data Retention**:
   - Historical data is stored for trend analysis
   - Configure retention based on your plan limits
   - Export important metrics for long-term storage

4. **Rate Limiting**:
   - Whop API has rate limits - monitor intervals respect these
   - Use comprehensive monitors for multiple metrics
   - Avoid creating too many individual monitors

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure your Whop API keys are configured correctly
   - Check that your company ID is valid
   - Verify user permissions for the company

2. **Missing Data**:
   - Some metrics may not be available for all companies
   - Check your Whop plan for API access limitations
   - Verify that the requested resources exist

3. **Rate Limiting**:
   - If you see rate limit errors, increase monitor intervals
   - Use comprehensive monitors instead of multiple individual ones
   - Contact support if you need higher rate limits

### Error Codes

- `400`: Invalid request parameters
- `401`: Authentication failed
- `403`: Insufficient permissions
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Server error

## Support

For questions or issues with Whop-native monitoring:

1. Check the [Whop API Documentation](https://docs.whop.com)
2. Review your monitor configuration
3. Check the monitoring engine logs
4. Contact support with specific error details

## Changelog

### Version 1.0.0
- Initial release of Whop-native monitoring
- Support for membership, revenue, community, and access pass monitoring
- Integration with existing alerting system
- Comprehensive monitoring configuration options 