# WatchTower Pro - Whop Platform Integration Guide

## Overview

WatchTower Pro is now fully integrated with the Whop platform, providing a seamless monitoring solution for Whop creators and businesses. This guide covers the complete setup and configuration process.

## Features

### 🔐 Authentication & User Management

- **Whop Native Authentication**: Seamless login through Whop's platform
- **User Profile Sync**: Automatic synchronization with Whop user profiles
- **Role-Based Access**: Support for different user roles (customer, admin)
- **Session Management**: Secure session handling with automatic token refresh

### 💳 Billing & Subscriptions

- **Real Whop Checkout**: Native Whop checkout integration
- **Subscription Management**: Automatic plan upgrades and downgrades
- **Webhook Sync**: Real-time subscription status updates
- **Pricing Tier Enforcement**: Automatic feature limitation based on plans

### 📊 Plan Features & Limitations

#### FREE Plan ($0/month)

- 1 monitor
- 5-minute check frequency
- Email notifications only
- Basic uptime monitoring
- Community support

#### STARTER Plan ($9.99/month)

- 5 monitors
- 1-minute check frequency
- Email & push notifications
- SSL certificate monitoring
- Basic incident management
- Email support

#### PROFESSIONAL Plan ($29.99/month)

- 25 monitors
- 30-second check frequency
- All notification channels
- Advanced alert conditions
- Discord & webhook integration
- Priority support
- Custom status page

#### ENTERPRISE Plan ($99.99/month)

- Unlimited monitors
- 15-second check frequency
- All notification channels
- SMS notifications
- Custom integrations
- Dedicated support
- White-label options
- Advanced analytics
- Team management

### 🖥️ Iframe Compatibility

- **Responsive Design**: Works perfectly in Whop's iframe environment
- **Touch-Friendly**: Optimized for mobile viewing
- **Performance Optimized**: Fast loading and smooth interactions
- **Cross-Browser Support**: Compatible with all major browsers

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```env
# Whop API Configuration
WHOP_API_KEY="your_whop_api_key_here"
NEXT_PUBLIC_WHOP_APP_ID="your_whop_app_id"
NEXT_PUBLIC_WHOP_AGENT_USER_ID="your_whop_agent_user_id"
NEXT_PUBLIC_WHOP_COMPANY_ID="your_whop_company_id"

# Whop Product IDs for billing
WHOP_STARTER_PRODUCT_ID="prod_starter_id"
WHOP_PROFESSIONAL_PRODUCT_ID="prod_professional_id"
WHOP_ENTERPRISE_PRODUCT_ID="prod_enterprise_id"

# Whop Webhook Configuration
WHOP_WEBHOOK_SECRET="your_whop_webhook_secret"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-app-domain.com"

# Database Configuration
DATABASE_URL="your_database_connection_string"
```

### 2. Database Setup

The app uses Prisma with PostgreSQL. Run the following commands:

```bash
# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma db push

# Seed the database (optional)
npx prisma db seed
```

### 3. Whop App Configuration

#### 3.1 App Settings

- **App Type**: Website/Service
- **Iframe Embedding**: Enabled
- **Checkout Integration**: Enabled
- **Webhook Endpoints**: Configured

#### 3.2 Webhook Configuration

Set up the following webhook endpoint in your Whop dashboard:

- **URL**: `https://your-app-domain.com/api/webhooks/whop`
- **Events**:
  - `subscription.created`
  - `subscription.updated`
  - `subscription.cancelled`
  - `subscription.deleted`
  - `payment.completed`

#### 3.3 Product Configuration

Create products in Whop for each plan:

- **Starter Plan**: $9.99/month
- **Professional Plan**: $29.99/month
- **Enterprise Plan**: $99.99/month

### 4. Build and Deploy

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

## Key Components

### Authentication Middleware

- **File**: `lib/auth/whop-auth-middleware.ts`
- **Purpose**: Validates Whop tokens and manages user sessions
- **Features**: User creation, plan sync, access control

### User Context

- **File**: `lib/context/WhopUserContext.tsx`
- **Purpose**: React context for user state management
- **Features**: User data, plan features, usage limits

### Billing Integration

- **Files**:
  - `app/api/billing/create-checkout/route.ts`
  - `app/api/billing/cancel/route.ts`
  - `app/api/webhooks/whop/route.ts`
- **Features**: Checkout creation, subscription management, webhook handling

### Iframe Compatibility

- **Files**:
  - `lib/styles/iframe-compatibility.css`
  - `next.config.ts`
  - `app/layout.tsx`
- **Features**: Responsive design, touch optimization, performance

## API Endpoints

### Authentication

- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check-limit` - Check usage limits

### Billing

- `POST /api/billing/create-checkout` - Create checkout session
- `POST /api/billing/cancel` - Cancel subscription
- `POST /api/webhooks/whop` - Handle Whop webhooks

### Monitoring

- `GET /api/monitors` - Get user monitors
- `POST /api/monitors` - Create monitor
- `PUT /api/monitors/:id` - Update monitor
- `DELETE /api/monitors/:id` - Delete monitor

### Alerts

- `GET /api/alerts` - Get user alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

## Usage Examples

### Checking User Authentication

```typescript
import { useWhopUser } from '@/lib/context/WhopUserContext';

function MyComponent() {
  const { user, loading, isAuthenticated } = useWhopUser();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Checking Plan Features

```typescript
import { useWhopUser } from '@/lib/context/WhopUserContext';

function FeatureComponent() {
  const { hasFeature, getPlanLimits } = useWhopUser();

  const canUseDiscord = hasFeature('discord_integration');
  const monitorLimit = getPlanLimits().monitors;

  return (
    <div>
      {canUseDiscord && <DiscordIntegration />}
      <p>You can create up to {monitorLimit} monitors</p>
    </div>
  );
}
```

### Creating Checkout Session

```typescript
const handleUpgrade = async (planType: PlanType) => {
  try {
    const response = await fetch("/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
    });

    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  } catch (error) {
    console.error("Checkout error:", error);
  }
};
```

## Security Considerations

### 1. Token Validation

- All API endpoints validate Whop tokens
- User sessions are managed securely
- Automatic token refresh handling

### 2. Input Validation

- All inputs are validated using Zod schemas
- SQL injection prevention
- XSS protection implemented

### 3. Rate Limiting

- API endpoints have rate limiting
- Plan-based usage enforcement
- Webhook signature verification

### 4. Data Protection

- User data is encrypted in transit
- Sensitive information is not logged
- Database connections are secure

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

- Check Whop API key configuration
- Verify app ID and user ID settings
- Ensure proper headers are sent

#### 2. Billing Issues

- Verify product IDs are correctly set
- Check webhook endpoint configuration
- Confirm subscription events are properly handled

#### 3. Iframe Issues

- Ensure proper Content-Security-Policy headers
- Check X-Frame-Options configuration
- Verify responsive design in iframe

#### 4. Performance Issues

- Check database connection settings
- Verify Next.js optimization settings
- Monitor API response times

### Support

For technical support:

- **Email**: support@watchtowerpro.com
- **Documentation**: [Internal docs link]
- **Whop Support**: Use Whop's support channels for billing issues

## Future Enhancements

### Planned Features

- **Team Management**: Multi-user support within organizations
- **Advanced Analytics**: Detailed performance metrics
- **Custom Integrations**: User-defined webhook endpoints
- **White-Label Options**: Branded monitoring dashboards
- **Mobile App**: Native mobile application

### API Improvements

- **GraphQL Support**: More efficient data fetching
- **Real-time Updates**: WebSocket connections
- **Bulk Operations**: Mass monitor management
- **Export Features**: Data export capabilities

## Conclusion

WatchTower Pro is now fully integrated with the Whop platform, providing:

- ✅ Seamless authentication and user management
- ✅ Real billing integration with Whop checkout
- ✅ Proper pricing tier enforcement
- ✅ Iframe compatibility for embedded use
- ✅ Comprehensive monitoring and alerting features

The integration ensures that users have a smooth experience while maintaining security and performance standards expected from a professional monitoring solution.

---

_Last Updated: [Current Date]_
_Version: 1.0_
