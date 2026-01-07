# Password Reset Email Template Configuration

## Setup Instructions

### 1. Configure Environment Variable

Add your production site URL to your `.env` file:

```env
VITE_SITE_URL=https://your-production-domain.com
```

**Important**: 
- Replace `https://your-production-domain.com` with your actual production domain
- Do **NOT** include `#` (for example, use `https://www.ballfour.org`, not `https://www.ballfour.org/#`)
- This ensures password reset links point to your production site, not localhost
- If not set, it will fallback to `window.location.origin` (useful for development)

### 2. Configure Email Template in Supabase

To configure the password reset email template in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Reset Password** template
4. Replace the default template with the HTML below
5. Save the changes

## Email Template HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Ball Four Foundation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">
                Ball Four Foundation
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: bold;">
                Reset Your Password
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Ball Four Foundation admin account. If you didn't make this request, you can safely ignore this email.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                To reset your password, click the button below:
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 30px 0; color: #0ea5e9; font-size: 14px; word-break: break-all; line-height: 1.6;">
                {{ .ConfirmationURL }}
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request a password reset, please contact an administrator immediately.
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #111827;">Ball Four Foundation Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; line-height: 1.6;">
                This is an automated email from Ball Four Foundation.<br>
                If you have any questions, please contact an administrator.
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
                © 2024 Ball Four Foundation. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Email Subject Line

Use this subject line in the Supabase email template settings:

```
Reset Your Password - Ball Four Foundation
```

## Important Notes

1. **Template Variables**: The `{{ .ConfirmationURL }}` is a Supabase template variable that will be automatically replaced with the actual reset link.

2. **Link Expiration**: Password reset links expire after 1 hour by default in Supabase. You can adjust this in Authentication → Settings.

3. **Redirect URL - CRITICAL**: Make sure your redirect URL is set correctly in Supabase:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to: `https://www.ballfour.org` (NO trailing slash, NO hash `#`)
   - Add to **Redirect URLs**:
     - `https://www.ballfour.org/reset-password` (NO trailing slash, NO hash)
     - `http://localhost:5173/reset-password` (for local development)
   - **IMPORTANT**: If your Site URL has a `#` or trailing `/`, Supabase will redirect to the wrong page
   - The Site URL must be exactly `https://www.ballfour.org` without any `#` or trailing `/`

4. **Testing**: After configuring the template, test the password reset flow:
   - Go to `/forgot-password` page
   - Enter an admin email
   - Check the email inbox for the reset link
   - Click the link and verify it redirects to `/reset-password`

## Customization

You can customize:
- Colors: Change the gradient colors (`#0ea5e9`, `#0284c7`) to match your brand
- Logo: Add your logo image URL in the header section
- Text: Modify the messaging to match your organization's tone
- Styling: Adjust padding, fonts, and spacing as needed

