# Google Analytics API Setup Guide

This guide explains how to complete the Google Analytics API integration for the Marketing Module.

## Current Status

The Marketing Module has been added to the admin panel with a "Website" submenu item. The frontend is ready to display Google Analytics data, and a Supabase Edge Function has been created to fetch the data.

**Note:** Currently, the edge function returns mock data. You need to complete the Google Analytics API integration to fetch real data.

## Required Credentials

You will need the following credentials to complete the setup:

- **Client ID:** `[YOUR_GOOGLE_CLIENT_ID]` (from Google Cloud Console)
- **Client Secret:** `[YOUR_GOOGLE_CLIENT_SECRET]` (from Google Cloud Console)
- **Google Analytics Measurement ID:** `G-019L6GKVNR` (this is for tracking code, NOT for API)
- **Google Analytics Property ID:** `[YOUR_NUMERIC_PROPERTY_ID]` (required - see below how to find it)

### ⚠️ IMPORTANT: Property ID vs Measurement ID

- **Measurement ID** (`G-019L6GKVNR`): Used in your website tracking code (gtag.js) - starts with "G-"
- **Property ID**: Numeric ID (e.g., `123456789`) - Required for the Data API

**How to find your Property ID:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon) in the bottom left
3. Under **Property** column, click **Property Settings**
4. Look for **Property ID** - it will be a numeric value (e.g., `123456789`)
5. **Copy this numeric ID** - this is what you need for the API

## Setup Steps

### 1. Set Environment Variables in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following environment variables:
   - `GA_CLIENT_ID` = `[YOUR_GOOGLE_CLIENT_ID]` (e.g., `878140352276-xxxxx.apps.googleusercontent.com`)
   - `GA_CLIENT_SECRET` = `[YOUR_GOOGLE_CLIENT_SECRET]` (e.g., `GOCSPX-xxxxx`)
   - `GA_PROPERTY_ID` = `[YOUR_NUMERIC_PROPERTY_ID]` (e.g., `123456789` - NOT the G-XXXXXXXXX Measurement ID!)
   - `GA_REFRESH_TOKEN` = (You need to obtain this - see step below)

**⚠️ Critical:** The `GA_PROPERTY_ID` must be the **numeric Property ID**, not the Measurement ID (`G-019L6GKVNR`). See above for how to find it.

### 2. Enable Google Analytics Data API (REQUIRED - This is the error you're seeing!)

**This is the most important step!** The error you're seeing means this API is not enabled.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project** (use your Google Cloud project)
3. **Enable the Google Analytics Data API**:
   - **Direct link**: https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview?project=YOUR_PROJECT_ID
   - Or navigate to: **APIs & Services** → **Library** → Search for "Google Analytics Data API" → Click **Enable**
4. Wait a few minutes after enabling for the changes to propagate
5. **Note**: You do NOT need the "Google Analytics Reporting API" (that's for Universal Analytics, which is deprecated). You only need the **Google Analytics Data API** (GA4)

### 3. Configure OAuth 2.0

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (the one matching your Client ID above)
3. Add authorized redirect URIs:
   - `http://localhost:8080` (for getting refresh token)
   - `https://developers.google.com/oauthplayground` (alternative method)
4. Add authorized JavaScript origins:
   - `http://localhost:8080`
   - `https://developers.google.com`

### 3.5. Get Refresh Token (Required)

To get a refresh token, you have two options:

**Option A: Using OAuth 2.0 Playground (Easiest)**
1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. In the left panel, find "Analytics Reporting API v4" → Select `https://www.googleapis.com/auth/analytics.readonly`
6. Click "Authorize APIs"
7. Sign in with a Google account that has access to your Google Analytics property
8. Click "Exchange authorization code for tokens"
9. Copy the "Refresh token" value
10. Add this as `GA_REFRESH_TOKEN` in Supabase Edge Function secrets

**Option B: Manual OAuth Flow**
1. Visit this URL in your browser (replace with your client ID):
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:8080&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&access_type=offline&prompt=consent
   ```
2. Authorize the application
3. You'll be redirected to `http://localhost:8080?code=...`
4. Copy the `code` parameter from the URL
5. Exchange the code for a refresh token using a POST request or OAuth 2.0 Playground

### 4. Grant Access to Google Analytics

1. In Google Analytics, go to **Admin** → **Property Access Management**
2. Add the service account email (from your Google Cloud project) with **Viewer** permissions
3. Or use OAuth2 to authenticate with a user account that has access

### 5. Update the Edge Function

The edge function at `supabase/functions/get-analytics/index.ts` needs to be updated with:

1. **OAuth2 Flow Implementation:**
   - Implement token exchange using the client ID and secret
   - Handle refresh tokens
   - Store tokens securely (consider using Supabase database)

2. **Google Analytics API Integration:**
   - Use the Google Analytics Data API (GA4) to fetch metrics
   - Request the following metrics:
     - `activeUsers` (Users)
     - `sessions` (Sessions)
     - `screenPageViews` (Page Views)
     - `bounceRate` (Bounce Rate)
     - `averageSessionDuration` (Avg Session Duration)
   - Fetch top pages data
   - Set date range (last 30 days)

### 6. Example API Call Structure

```typescript
// Example structure for Google Analytics Data API (GA4)
const response = await fetch(
  `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      dimensions: [{ name: 'pagePath' }],
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true,
        },
      ],
      limit: 5,
    }),
  }
)
```

### 7. Deploy the Edge Function

```bash
# From your project root
supabase functions deploy get-analytics
```

## Testing

1. Log in to the admin panel
2. Navigate to **Marketing Module** → **Website**
3. The page should display analytics data
4. Click "Refresh" to reload data

## Troubleshooting

- **401 Unauthorized:** Check that your OAuth credentials are correct and the API is enabled
- **403 Forbidden:** Ensure the service account or OAuth user has access to the Google Analytics property
- **No data:** Verify the property ID is correct and data exists in Google Analytics
- **CORS errors:** The edge function already includes CORS headers, but verify they're working

## Resources

- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)

## Security Notes

- Never commit client secrets to version control
- Use Supabase secrets for sensitive credentials
- Implement proper token refresh logic
- Consider rate limiting for API calls

