# WatchTower Pro Tiered Pricing System

## Overview

The WatchTower Pro tiered pricing system provides comprehensive feature gates, usage limits enforcement, and seamless billing integration with Whop's payment platform. This system enforces plan-based restrictions across the entire application and provides smooth upgrade flows for users.

## Pricing Tiers

### Free Plan

- **Price**: $0/month
- **Monitors**: 3
- **Check Frequency**: 60 minutes
- **Data Retention**: 7 days
- **Alerts**: 1
- **Team Members**: 1
- **Features**: Basic monitoring, Email alerts only
- **Channels**: EMAIL

### Basic Plan (Starter)

- **Price**: $29/month
- **Monitors**: 25
- **Check Frequency**: 10 minutes
- **Data Retention**: 30 days
- **Alerts**: 10
- **Team Members**: 3
- **Features**: Basic monitoring, Email alerts, Slack integration, Whop metrics, SSL monitoring, Advanced analytics
- **Channels**: EMAIL, SLACK
- **Whop Product ID**: `prod_BASIC_PLAN`

### Pro Plan (Professional)

- **Price**: $99/month
- **Monitors**: 100
- **Check Frequency**: 5 minutes
- **Data Retention**: 90 days
- **Alerts**: 50
- **Team Members**: 10
- **Features**: All Basic features + Custom webhooks, API access, Custom domains, Priority support
- **Channels**: EMAIL, SLACK, DISCORD, WEBHOOK, SMS
- **Whop Product ID**: `prod_PRO_PLAN`

### Enterprise Plan

- **Price**: $299/month
- **Monitors**: Unlimited
- **Check Frequency**: 1 minute
- **Data Retention**: 365 days
- **Alerts**: Unlimited
- **Team Members**: Unlimited
- **Features**: All Pro features + Everything included
- **Channels**: EMAIL, SLACK, DISCORD, WEBHOOK, SMS, PUSH
- **Whop Product ID**: `prod_ENTERPRISE_PLAN`

## Architecture

### Core Components

1. **PricingService** (`lib/pricing.ts`)
   - Central configuration for all plan limits and features
   - Usage validation and limit checking
   - Upgrade suggestions and cost calculations

2. **Pricing Middleware** (`lib/middleware/pricing-middleware.ts`)
   - Feature gates and access control
   - Usage limit enforcement
   - Frequency restrictions
   - Notification channel restrictions

3. **Enhanced Billing API** (`app/api/billing/route.ts`)
   - Whop checkout session creation
   - Plan upgrade/downgrade handling
   - Usage reporting and analytics

4. **Enhanced Monitors API** (`app/api/monitors/route.ts`)
   - Real-time limit enforcement during creation
   - Feature access validation
   - Frequency limit checking

### Key Features

#### Feature Gates

```typescript
// Check if user has access to a specific feature
const hasAccess = PricingService.hasFeatureAccess(planType, "whopMetrics");

// Middleware enforcement
const featureCheck = await requireFeature(request, userId, {
  feature: "customWebhooks",
});
```

#### Usage Limits

```typescript
// Check if user can create more monitors
const canCreate = await PricingService.canCreateMonitor(userId, planType);

// Middleware enforcement
const usageCheck = await requireUsageLimit(request, userId, {
  type: "monitors",
});
```

#### Frequency Restrictions

```typescript
// Validate check frequency for plan
const isValid = PricingService.isValidCheckFrequency(planType, intervalSeconds);

// Middleware enforcement
const frequencyCheck = await requireFrequencyLimit(request, userId, {
  intervalSeconds: 300, // 5 minutes
});
```

#### Channel Restrictions

```typescript
// Check notification channel access
const hasChannelAccess = PricingService.hasChannelAccess(planType, "SLACK");

// Middleware enforcement
const channelCheck = await requireChannelAccess(request, userId, {
  channel: "WEBHOOK",
});
```

## Usage Examples

### API Route Protection

```typescript
import { requirePlanAccess } from "@/lib/middleware/pricing-middleware";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  // Check multiple requirements at once
  const planCheck = await requirePlanAccess(request, userId, {
    features: ["whopMetrics", "apiAccess"],
    usageChecks: [{ type: "monitors" }],
    frequencyCheck: { intervalSeconds: 300 },
    channelChecks: [{ channel: "WEBHOOK" }],
  });

  if (planCheck) {
    return planCheck; // Returns error response with upgrade info
  }

  // Proceed with API logic
}
```

### Monitor Creation with Limits

```typescript
// In monitor creation endpoint
const usageCheck = await requireUsageLimit(request, userId, {
  type: "monitors",
  redirectUrl: "/billing/upgrade?feature=monitors",
});

if (usageCheck) {
  return usageCheck; // Automatic upgrade prompt
}

// Check feature requirements based on monitor type
const featureRequirements = [];
if (monitorData.type.startsWith("WHOP_")) {
  featureRequirements.push("whopMetrics");
}
if (monitorData.sslCheck) {
  featureRequirements.push("sslMonitoring");
}

const featureCheck = await requirePlanAccess(request, userId, {
  features: featureRequirements,
  frequencyCheck: { intervalSeconds: monitorData.interval },
});

if (featureCheck) {
  return featureCheck;
}
```

### Frontend Upgrade Prompts

```typescript
import UpgradePrompt from '@/components/billing/UpgradePrompt';

// Show upgrade prompt for specific feature
<UpgradePrompt
  currentPlan={user.plan}
  userId={user.id}
  feature="Whop Metrics Monitoring"
  onUpgrade={(plan) => console.log('Upgrading to:', plan)}
/>

// Dynamic upgrade prompt
import { showUpgradePrompt } from '@/components/billing/UpgradePrompt';

showUpgradePrompt({
  currentPlan: user.plan,
  userId: user.id,
  feature: 'SSL Monitoring'
});
```

## API Endpoints

### Billing Management

- `GET /api/billing?userId={id}` - Get billing info and usage
- `POST /api/billing` - Handle plan changes and upgrades
  - `action: 'create_upgrade_session'` - Create Whop checkout
  - `action: 'preview_upgrade'` - Preview upgrade costs
  - `action: 'cancel_subscription'` - Cancel subscription

### Pricing Information

- `GET /api/pricing/plans` - Get all plan configurations
- `POST /api/pricing/usage` - Get user usage and suggestions

### Enhanced Monitor Management

- Monitor creation automatically enforces limits and features
- Real-time validation of plan restrictions
- Automatic upgrade prompts on limit violations

## Whop Integration

### Checkout Flow

1. User requests upgrade via API or component
2. System creates Whop checkout session
3. User redirected to Whop payment page
4. On success, user plan updated in database
5. New limits immediately enforced

### Configuration

Set environment variables:

```env
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
WHOP_API_KEY=your_api_key
NEXT_PUBLIC_WHOP_CHECKOUT_URL=https://whop.com/checkout
```

Update product IDs in `lib/pricing.ts`:

```typescript
whopProductId: "prod_ACTUAL_BASIC_PLAN"; // Replace placeholder IDs
```

## Frontend Components

### Billing Page (`/billing`)

- Comprehensive plan comparison
- Current usage visualization
- Upgrade suggestions
- Real-time plan management

### Upgrade Prompts

- Context-aware upgrade suggestions
- Feature-specific messaging
- Seamless checkout integration
- Auto-dismissing notifications

### Usage Indicators

- Real-time usage bars
- Limit approaching warnings
- Plan-specific feature highlighting

## Error Handling

The system provides detailed error responses for limit violations:

```typescript
{
  "error": "Usage limit exceeded",
  "message": "You've reached the limit of 3 monitors for your Free plan.",
  "currentPlan": "FREE",
  "usage": {
    "current": 3,
    "limit": 3,
    "percentage": 100
  },
  "upgradeRequired": true,
  "redirectUrl": "/billing/upgrade?feature=monitors"
}
```

## Best Practices

### Development

1. Always use middleware for protection
2. Provide clear upgrade paths
3. Test with different plan types
4. Handle edge cases gracefully

### User Experience

1. Show upgrade prompts contextually
2. Explain value of higher tiers
3. Provide usage visibility
4. Make upgrades seamless

### Security

1. Validate user access on every request
2. Use server-side enforcement
3. Don't trust client-side checks
4. Log usage for auditing

## Testing

Test different scenarios:

```typescript
// Test plan limits
const freeUser = { plan: PlanType.FREE };
const canCreate = await PricingService.canCreateMonitor(userId, freeUser.plan);

// Test feature access
const hasWebhooks = PricingService.hasFeatureAccess(
  PlanType.STARTER,
  "customWebhooks",
);

// Test frequency limits
const isValidFreq = PricingService.isValidCheckFrequency(PlanType.FREE, 1800); // 30 min
```

## Migration Guide

If upgrading from the old system:

1. Update imports to use new `PricingService`
2. Replace old limit checks with middleware
3. Update frontend to use new components
4. Configure Whop product IDs
5. Test upgrade flows thoroughly

## Support

For issues with the pricing system:

1. Check console logs for detailed errors
2. Verify environment variables
3. Test with different plan types
4. Review middleware enforcement
5. Check Whop integration status

The system is designed to be robust and fail gracefully, always erring on the side of allowing access rather than blocking legitimate users.
