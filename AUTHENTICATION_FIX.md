# Authentication Fix - "You do not have permission to view this capsule" Error

## Problem
Users were unable to open their own capsules, receiving the error:
```
API request failed: Error: {"success":false,"message":"You do not have permission to view this capsule"}
```

This occurred even though the user was the creator of the capsule.

## Root Cause
The API client was caching the authentication token in the constructor (`this.token`), but not refreshing it when making subsequent requests. This caused several issues:

1. **Stale Token Reference**: After login, the token was stored in localStorage, but the API client instance variable wasn't always synchronized
2. **Session Management**: Page reloads or component re-renders could cause the instance token to be out of sync with localStorage
3. **Race Conditions**: Quick successive requests might use different token values

The backend was correctly verifying the token and checking permissions, but the frontend was sometimes sending outdated or missing tokens.

## Files Fixed

### `frontend/src/lib/api.js`

#### 1. Fixed `getHeaders()` method
**Before:**
```javascript
getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth && this.token) {
    headers.Authorization = `Bearer ${this.token}`;
  }

  return headers;
}
```

**After:**
```javascript
getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    // Always get the latest token from localStorage
    const currentToken = localStorage.getItem('token') || this.token;
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }
  }

  return headers;
}
```

**Why this works:** 
- Always reads the latest token from localStorage on every request
- Falls back to instance variable if localStorage is empty
- Ensures consistency across all API calls

#### 2. Fixed `uploadMedia()` method
**Before:**
```javascript
async uploadMedia(formData) {
  const url = `${this.baseURL}/media/upload`;
  const config = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${this.token}`,
      // ...
    },
    body: formData
  };
  // ...
}
```

**After:**
```javascript
async uploadMedia(formData) {
  const url = `${this.baseURL}/media/upload`;
  // Always get the latest token from localStorage
  const currentToken = localStorage.getItem('token') || this.token;
  const config = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${currentToken}`,
      // ...
    },
    body: formData
  };
  // ...
}
```

#### 3. Fixed `createCapsule()` method
**Before:**
```javascript
async createCapsule(capsuleData) {
  // ... formData setup ...
  
  return this.request('/capsules', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${this.token}`,
      // ...
    },
    body: formData,
  });
}
```

**After:**
```javascript
async createCapsule(capsuleData) {
  // ... formData setup ...
  
  // Always get the latest token from localStorage
  const currentToken = localStorage.getItem('token') || this.token;
  return this.request('/capsules', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${currentToken}`,
      // ...
    },
    body: formData,
  });
}
```

## How the Backend Permission Check Works

The backend uses this flow to verify access:

1. **Auth Middleware** (`backend/middleware/auth.js`):
   - Extracts Bearer token from `Authorization` header
   - Verifies JWT signature
   - Loads user from database and sets `req.user`

2. **Capsule Controller** (`backend/controllers/capsuleController.js`):
   - Fetches capsule from database
   - Calls `capsule.canView(req.user._id)` to check permissions

3. **Capsule Model** (`backend/models/Capsule.js`):
   - Compares `userId` with `creator` ID (owner always has access)
   - Checks if user is in `sharedWith` array
   - Returns `true` if either condition is met

## Why the Fix Works

1. **Single Source of Truth**: localStorage is now the authoritative source for the token
2. **Always Fresh**: Every request reads the current token, eliminating sync issues
3. **Backward Compatible**: Still falls back to instance variable if needed
4. **Consistent**: All API methods (regular requests, uploads, FormData) use the same approach

## Testing the Fix

1. **Clear Browser Data**:
   - Open DevTools (F12)
   - Go to Application/Storage tab
   - Clear localStorage
   - Hard refresh (Ctrl+F5)

2. **Login Again**:
   - Log in with your credentials
   - Token will be freshly stored in localStorage

3. **Test Capsule Access**:
   - Navigate to Dashboard
   - Click on your own capsules
   - They should open without permission errors

4. **Test Other Features**:
   - Create new capsules
   - Upload media
   - View lottery capsules
   - Access journal entries

## Additional Benefits

This fix also improves:
- **Media uploads** - Now properly authenticated
- **Capsule creation** - Token always current
- **Multi-tab sync** - Changes in one tab reflect in others (if token updated)
- **Session recovery** - Better handling of page reloads

## Debugging Tips

If you still see authentication errors:

1. **Check Token in DevTools**:
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   ```

2. **Verify Token is Valid**:
   - Go to https://jwt.io
   - Paste your token
   - Check expiration time (`exp` field)

3. **Check Network Tab**:
   - Open DevTools Network tab
   - Look for failed API requests
   - Check if `Authorization` header is present
   - Verify header format: `Bearer <token>`

4. **Backend Logs**:
   - Check server console for auth errors
   - Look for "Token verification error" messages
   - Verify user lookup succeeds

## Build Status
✅ Build completed successfully with no errors
✅ All authentication flows updated
✅ Token management improved

## Next Steps

1. **Deploy the Changes**:
   - Upload the new `dist/` folder to your hosting service (Vercel)
   - Ensure environment variables are set correctly

2. **Test in Production**:
   - Clear browser cache
   - Log in fresh
   - Test capsule access
   - Verify no permission errors

3. **Monitor Errors**:
   - Watch for any authentication failures
   - Check if users report issues
   - Monitor backend logs for permission denials

The authentication issue should now be fully resolved! 🎉

