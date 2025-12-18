# Google OAuth Configuration Guide

## 🔧 **Required Configuration in Google Cloud Console**

To fix the `redirect_uri_mismatch` error, you need to configure the following in your Google Cloud Console:

### Step 1: Navigate to OAuth Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID: `141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com`
5. Click on it to edit

### Step 2: Add Authorized JavaScript Origins

Click **"Add URI"** and add:
```
http://localhost:3000
```

**For Production (add these too):**
```
https://yourdomain.com
https://www.yourdomain.com
```

### Step 3: Add Authorized Redirect URIs

Click **"Add URI"** and add:
```
http://localhost:3000
```

**For Production (add these too):**
```
https://yourdomain.com
https://www.yourdomain.com
```

### Step 4: Save

Click the **"Save"** button at the bottom.

**Note:** Changes may take 5 minutes to a few hours to take effect, but usually work within a few minutes.

---

## ✅ **Quick Checklist**

- [ ] Added `http://localhost:3000` to **Authorized JavaScript origins**
- [ ] Added `http://localhost:3000` to **Authorized redirect URIs**
- [ ] Clicked **Save**
- [ ] Waited a few minutes for changes to propagate

---

## 🐛 **Troubleshooting**

### Still getting redirect_uri_mismatch?

1. **Double-check the URIs:**
   - Must match exactly (including `http://` vs `https://`)
   - No trailing slashes
   - Case-sensitive

2. **Clear browser cache:**
   - Clear cookies for `localhost:3000`
   - Try incognito/private mode

3. **Wait a few minutes:**
   - Google says changes can take up to a few hours
   - Usually works within 5-10 minutes

4. **Check the exact error:**
   - The error message shows the origin that was rejected
   - Make sure that exact origin is in the authorized list

---

## 📋 **Current Configuration**

**Client ID:** `141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com`

**Required Origins:**
- `http://localhost:3000` (Development)
- `https://yourdomain.com` (Production - when ready)

**Required Redirect URIs:**
- `http://localhost:3000` (Development)
- `https://yourdomain.com` (Production - when ready)

---

## 🚀 **After Configuration**

Once you've added the URIs and saved:

1. Wait 2-5 minutes
2. Try Google Sign-In again
3. Should work without errors!

---

## 📝 **For Production Deployment**

When deploying to production, remember to:

1. Add your production domain to both lists
2. Update `GOOGLE_CLIENT_ID` in environment variables if needed
3. Ensure HTTPS is enabled (Google requires HTTPS for production)

---

## ✅ **Verification**

After configuration, you should see:
- No redirect_uri_mismatch errors
- Google OAuth popup opens correctly
- Successful authentication
- User redirected to dashboard/preferences

