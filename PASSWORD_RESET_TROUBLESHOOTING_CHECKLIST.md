# Password Reset Troubleshooting Checklist

## ✅ Pre-Flight Checks

### 1. Environment Variables
- [ ] **Vercel Environment Variable**: `VITE_SITE_URL` is set to `https://www.ballfour.org` (NO hash, NO trailing slash)
  - Location: Vercel Dashboard → Your Project → Settings → Environment Variables
  - Verify: Check production build logs or add `console.log(import.meta.env.VITE_SITE_URL)` temporarily

### 2. Supabase Authentication URL Configuration
- [ ] **Site URL** in Supabase is set to: `https://www.ballfour.org`
  - Location: Supabase Dashboard → Authentication → URL Configuration → Site URL
  - ⚠️ **CRITICAL**: Must NOT have:
    - Trailing slash `/`
    - Hash `#`
    - `www` vs non-www mismatch

- [ ] **Redirect URLs** includes: `https://www.ballfour.org/reset-password`
  - Location: Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
  - Must include the exact path: `/reset-password`
  - Check both `https://www.ballfour.org/reset-password` and `https://ballfour.org/reset-password` (if both are used)

### 3. Supabase Email Template Configuration
- [ ] **Reset Password Email Template** uses `{{ .ConfirmationURL }}` variable
  - Location: Supabase Dashboard → Authentication → Email Templates → Reset Password
  - The template should NOT hardcode any URLs
  - The link should be: `<a href="{{ .ConfirmationURL }}">Reset Password</a>`

### 4. Code Verification

#### Check ForgotPassword.tsx
- [ ] Console shows correct redirect URL: `https://www.ballfour.org/reset-password` (check browser console when submitting)
- [ ] The `getBaseSiteUrl()` function is stripping hashes correctly
- [ ] `redirectTo` parameter is being passed correctly to `resetPasswordForEmail()`

#### Check ResetPassword.tsx
- [ ] Component is extracting tokens from URL hash fragments (`#access_token=...`)
- [ ] Component is setting session on mount (not just on submit)
- [ ] No errors in browser console when landing on reset password page

### 5. Email Link Inspection

When you receive the password reset email:
- [ ] **Right-click the reset link** → "Copy link address"
- [ ] **Inspect the full URL**. It should look like:
  ```
  https://www.ballfour.org/reset-password#access_token=...&refresh_token=...&type=recovery
  ```
- [ ] **Should NOT be**:
  - `https://www.ballfour.org/#access_token=...` ❌
  - `https://www.ballfour.org/reset-password/#access_token=...` ❌
  - `https://ballfour.org/reset-password#access_token=...` (if you use www) ⚠️

### 6. Vercel Configuration

- [ ] **vercel.json** has rewrite rules configured:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- [ ] Vercel deployment has completed successfully
- [ ] Environment variables are set for **Production** environment in Vercel

### 7. Domain & DNS

- [ ] Both `www.ballfour.org` and `ballfour.org` are configured correctly
- [ ] If using both, ensure consistency (use one primary domain)
- [ ] Check if there are any redirects happening at the domain level

## 🔍 Debugging Steps

### Step 1: Verify Environment Variable
```javascript
// Temporarily add to ForgotPassword.tsx to check what's being used
console.log('VITE_SITE_URL:', import.meta.env.VITE_SITE_URL)
console.log('Final redirect URL:', redirectUrl)
```

### Step 2: Check Supabase Logs
- [ ] Go to Supabase Dashboard → Logs → Auth Logs
- [ ] Look for recent password reset attempts
- [ ] Check what redirect URL Supabase is actually using

### Step 3: Test Email Link Directly
1. [ ] Copy the reset link from email
2. [ ] Paste it in a new incognito/private browser window
3. [ ] Check what the final URL is in the address bar
4. [ ] Check browser console for any errors

### Step 4: Check Network Tab
- [ ] Open browser DevTools → Network tab
- [ ] Click the reset link from email
- [ ] Look for redirects (301, 302, 307 responses)
- [ ] Check what URL is being requested

## 🚨 Common Issues & Solutions

### Issue 1: Redirect to `https://www.ballfour.org/#`
**Cause**: Supabase Site URL has a `#` or is missing the path
**Solution**: 
- Set Site URL in Supabase to: `https://www.ballfour.org` (exact, no hash, no trailing slash)
- Add to Redirect URLs: `https://www.ballfour.org/reset-password`

### Issue 2: Redirect URL shows correctly in console but email has wrong link
**Cause**: Supabase is overriding the `redirectTo` parameter with Site URL
**Solution**:
- Ensure `redirectTo` in code matches exactly what's in Supabase Redirect URLs
- Make sure Site URL doesn't have a path (should be just the domain)

### Issue 3: "Invalid or expired reset link" error
**Cause**: Tokens not being extracted properly or session not set
**Solution**:
- Check if URL has hash fragments (`#access_token=...`)
- Verify ResetPassword component is extracting tokens on mount
- Check browser console for session errors

### Issue 4: www vs non-www mismatch
**Cause**: Redirect URL uses `ballfour.org` but Supabase expects `www.ballfour.org` or vice versa
**Solution**:
- Ensure consistency across all configurations
- Add both to Redirect URLs if needed: 
  - `https://www.ballfour.org/reset-password`
  - `https://ballfour.org/reset-password`

## 📋 Final Verification Checklist

After making changes:
1. [ ] Update Supabase Site URL and Redirect URLs
2. [ ] Verify Vercel environment variable is correct
3. [ ] Redeploy Vercel (if environment variable was changed)
4. [ ] Request a NEW password reset email (old links won't work)
5. [ ] Check the NEW email link format
6. [ ] Click the link in an incognito window
7. [ ] Verify it goes to `https://www.ballfour.org/reset-password#access_token=...`
8. [ ] Check browser console for any errors
9. [ ] Try resetting password and verify it works

## 🆘 If Still Not Working

1. **Check Supabase Auth Logs**: Look for errors or unexpected redirects
2. **Compare URLs**: 
   - What console shows: `https://ballfour.org/reset-password`
   - What email has: (inspect the actual link)
   - What Supabase Site URL is: (check dashboard)
3. **Test in isolation**: Create a simple test page to verify Supabase redirect behavior
4. **Contact Supabase Support**: If Site URL is correct but redirects still wrong

---

## Quick Reference: Correct Configuration

### Supabase Dashboard Settings:
```
Site URL: https://www.ballfour.org

Redirect URLs:
- https://www.ballfour.org/reset-password
- https://ballfour.org/reset-password (if using non-www)
```

### Vercel Environment Variable:
```
VITE_SITE_URL=https://www.ballfour.org
```

### Expected Email Link Format:
```
https://www.ballfour.org/reset-password#access_token=eyJ...&refresh_token=...&type=recovery&expires_in=3600
```

