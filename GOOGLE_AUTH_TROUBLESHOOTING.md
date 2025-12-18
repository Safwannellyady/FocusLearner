# Google Authentication Troubleshooting Guide

## 🔍 **Common Issues and Solutions**

### Issue: "Google signup failed. Please try again"

This error can occur for several reasons. Here's how to debug and fix it:

---

## ✅ **Step 1: Check Backend Logs**

Check your backend terminal for error messages. Look for:
- Token verification errors
- Client ID mismatches
- Network errors
- Database errors

---

## ✅ **Step 2: Verify Configuration**

### Backend Configuration:
1. **Client ID is set:**
   - Check `backend/services/google_auth.py`
   - Should have: `GOOGLE_CLIENT_ID = '141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com'`

2. **Environment Variables (Optional):**
   - Can set in `.env` file:
   ```env
   GOOGLE_CLIENT_ID=141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com
   ```

### Frontend Configuration:
1. **Client ID in App.js:**
   - Should match backend client ID
   - Currently: `141636012206-oviq8cma0p7pkmvlatc54dia781ov87m.apps.googleusercontent.com`

2. **GoogleOAuthProvider:**
   - Must wrap the entire app in `App.js`

---

## ✅ **Step 3: Check Google Cloud Console**

1. **Authorized JavaScript Origins:**
   - Must include: `http://localhost:3000`
   - No trailing slash
   - Exact match required

2. **Authorized Redirect URIs:**
   - Must include: `http://localhost:3000`
   - Can add more if needed

3. **OAuth Consent Screen:**
   - Must be configured
   - User type set (Internal/External)
   - Scopes added (email, profile)

---

## ✅ **Step 4: Test Token Flow**

### Check Browser Console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Sign in with Google"
4. Look for any JavaScript errors

### Check Network Tab:
1. Open DevTools → Network tab
2. Click "Sign in with Google"
3. Find the request to `/api/auth/google`
4. Check:
   - Request payload (should have `token`)
   - Response status code
   - Response body (error message)

---

## 🔧 **Common Fixes**

### Fix 1: Syntax Error (Already Fixed)
- Missing comma in response JSON
- ✅ Fixed in `backend/routes/auth_routes.py`

### Fix 2: Client ID Not Set
- Backend needs client ID to verify tokens
- ✅ Now defaults to your client ID

### Fix 3: Token Format Issue
- `@react-oauth/google` provides `access_token`
- Backend now handles access tokens correctly
- ✅ Improved token verification

### Fix 4: CORS Issues
- Backend should have CORS enabled
- ✅ Already configured in `app.py`

---

## 🧪 **Manual Testing**

### Test Backend Endpoint Directly:

```bash
# Using curl or Postman
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_GOOGLE_ACCESS_TOKEN"}'
```

Replace `YOUR_GOOGLE_ACCESS_TOKEN` with a real token from Google OAuth.

---

## 📋 **Debug Checklist**

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Client ID matches in both frontend and backend
- [ ] Google Cloud Console has correct URIs configured
- [ ] OAuth consent screen is configured
- [ ] Browser console shows no JavaScript errors
- [ ] Network tab shows request to `/api/auth/google`
- [ ] Backend logs show token verification attempts
- [ ] Database is accessible and tables exist

---

## 🐛 **Error Messages Explained**

### "Invalid Google token"
- Token verification failed
- Check backend logs for details
- May need to wait for Google Cloud Console changes

### "Email not provided by Google"
- User denied email permission
- Check OAuth scopes in Google Cloud Console

### "Google token is required"
- Frontend didn't send token
- Check network request payload

### "Authentication failed: [error]"
- Backend error occurred
- Check backend logs for full error

---

## 🔄 **Restart After Changes**

After making any configuration changes:

1. **Restart Backend:**
   ```bash
   # Stop current backend (Ctrl+C)
   cd backend
   python app.py
   ```

2. **Restart Frontend:**
   ```bash
   # Stop current frontend (Ctrl+C)
   cd frontend
   npm start
   ```

3. **Clear Browser Cache:**
   - Clear cookies for localhost:3000
   - Or use incognito/private mode

---

## 📞 **Still Not Working?**

1. Check backend terminal for detailed error messages
2. Check browser console for JavaScript errors
3. Check Network tab for API request/response
4. Verify all configuration steps above
5. Try traditional email/password login to verify system works
6. Check if Google OAuth popup opens (if not, check client ID)

---

## ✅ **Expected Flow**

1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User selects Google account
4. Popup closes
5. Frontend receives access token
6. Frontend sends token to `/api/auth/google`
7. Backend verifies token with Google
8. Backend gets user info
9. Backend creates/finds user
10. Backend returns JWT token
11. Frontend stores token and redirects

If any step fails, check the logs for that step.

