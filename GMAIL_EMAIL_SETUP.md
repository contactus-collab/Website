# Gmail Email Setup Guide

This guide will help you set up Gmail API integration for sending emails from the Email Campaign page.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Supabase project with Edge Functions enabled
- **If you already have Google Analytics set up**: You can reuse the same Client ID and Client Secret!

## Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select the same project you're using for Google Analytics (if applicable)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Gmail API"
5. Click on **Gmail API** and click **Enable**

## Step 2: Update OAuth Consent Screen (if needed)

If you're reusing the same OAuth credentials from Google Analytics:

1. Go to **APIs & Services** > **OAuth consent screen**
2. Click **Edit App**
3. In the **Scopes** section, click **Add or Remove Scopes**
4. Search for and add: `https://www.googleapis.com/auth/gmail.send`
5. Click **Update** and **Save and Continue**

**Note**: If you're creating new OAuth credentials, follow the standard OAuth setup process.

## Step 3: Get Refresh Token with Gmail Scope

Since refresh tokens are scope-specific, you need to generate a new refresh token that includes the Gmail send scope:

### Option A: Generate New Refresh Token with Both Scopes (Recommended)

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your existing **Client ID** and **Client Secret** (same ones used for Analytics)
5. In the left panel, find and select **BOTH**:
   - **Google Analytics Reporting API v4**: `https://www.googleapis.com/auth/analytics.readonly`
   - **Gmail API v1**: `https://www.googleapis.com/auth/gmail.send`
6. Click **Authorize APIs**
7. Sign in with your Google account and grant permissions for both scopes
8. Click **Exchange authorization code for tokens**
9. **Copy the Refresh Token** - This new token will work for both Analytics and Gmail

### Option B: Keep Separate Refresh Tokens

If you prefer to keep separate tokens:
1. Follow the same process but only select the Gmail scope
2. Save this as `GMAIL_REFRESH_TOKEN` in Supabase secrets
3. Keep your existing `GA_REFRESH_TOKEN` for Analytics

## Step 4: Set Up Supabase Secrets

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Edge Functions** > **Secrets**

### If Reusing Google Analytics Credentials:

You should already have these set:
- ✅ `GA_CLIENT_ID`: Your OAuth 2.0 Client ID (already set)
- ✅ `GA_CLIENT_SECRET`: Your OAuth 2.0 Client Secret (already set)

Add these new secrets:
- `GMAIL_REFRESH_TOKEN`: The refresh token with Gmail scope (from Step 3)
  - **OR** if you generated a token with both scopes, you can update `GA_REFRESH_TOKEN` to the new one
- `GMAIL_USER`: Your Gmail email address (e.g., `yourname@gmail.com`)

### If Using Separate Credentials:

Add all of these:
- `GA_CLIENT_ID`: Your OAuth 2.0 Client ID (or use separate `GMAIL_CLIENT_ID`)
- `GA_CLIENT_SECRET`: Your OAuth 2.0 Client Secret (or use separate `GMAIL_CLIENT_SECRET`)
- `GMAIL_REFRESH_TOKEN`: The refresh token from OAuth Playground
- `GMAIL_USER`: Your Gmail email address (e.g., `yourname@gmail.com`)

## Step 6: Deploy Edge Function

Deploy the `send-email` edge function:

```bash
supabase functions deploy send-email
```

Or use the Supabase Dashboard:
1. Go to **Edge Functions** in your Supabase dashboard
2. The function should be automatically deployed if you've pushed to your repository

## Step 7: Test the Integration

1. Log in to your admin panel
2. Navigate to **Email Campaign**
3. Fill in the form:
   - Subject: Test Email
   - Recipients: Your email address
   - Content Type: Plain Text or HTML
   - Content: Test message
4. Click **Send Emails**
5. Check your inbox for the test email

## Troubleshooting

### Error: "Gmail configuration missing"
- Make sure all four secrets (`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_USER`) are set in Supabase

### Error: "Failed to get access token"
- Verify your Client ID, Client Secret, and Refresh Token are correct
- Make sure the Gmail API is enabled in your Google Cloud project
- Check that the refresh token hasn't expired (they can expire if revoked)

### Error: "Gmail API error: 403"
- Make sure you've granted the `gmail.send` scope
- Verify your OAuth consent screen is properly configured
- If in testing mode, ensure the recipient email is added as a test user

### Emails not being received
- Check spam/junk folder
- Verify the recipient email address is correct
- Check Supabase Edge Function logs for detailed error messages

## Security Notes

- Never commit secrets to your repository
- Use Supabase secrets for all sensitive credentials
- Regularly rotate your OAuth credentials
- Monitor Edge Function logs for any suspicious activity

## Production Considerations

1. **OAuth Consent Screen**: If your app is in testing mode, you'll need to publish it for production use
2. **Rate Limits**: Gmail API has rate limits (250 quota units per user per second)
3. **Email Limits**: Gmail has sending limits (500 emails per day for free accounts, 2000 for Google Workspace)
4. **Monitoring**: Set up alerts for failed email sends

## Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

