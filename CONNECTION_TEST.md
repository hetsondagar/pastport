# PastPort Frontend-Backend Connection Test

This guide will help you verify that your frontend and backend are properly connected.

## Prerequisites

1. **Backend running** on `http://localhost:5000`
2. **Frontend running** on `http://localhost:5173`
3. **MongoDB** connected and running
4. **Environment variables** configured

## Step-by-Step Connection Test

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

### 2. Test Backend Health

Open your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "PastPort API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### 3. Test Frontend-Backend Connection

1. **Open frontend**: Go to `http://localhost:5173`
2. **Check console**: Open browser dev tools (F12) and check for any errors
3. **Test registration**: Try creating a new account
4. **Test login**: Try logging in with the created account

### 4. Test API Endpoints Directly

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get capsules (with token):**
```bash
curl -X GET http://localhost:5000/api/capsules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Frontend Integration Tests

#### Test Authentication Flow
1. Go to `http://localhost:5173`
2. Try registering a new user
3. Try logging in
4. Check if you're redirected to dashboard
5. Check if user info appears in navigation

#### Test Capsule Creation
1. Click "Create" or "New Capsule"
2. Fill out the form
3. Submit the form
4. Check if capsule appears in dashboard

#### Test Dashboard
1. Go to dashboard
2. Check if stats load correctly
3. Check if capsules load (if any exist)
4. Test search and filter functionality

## Troubleshooting Common Issues

### 1. CORS Errors

**Error:** `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:**
- Check that `FRONTEND_URL=http://localhost:5173` is set in backend `.env`
- Restart the backend server

### 2. Connection Refused

**Error:** `Failed to fetch` or `Connection refused`

**Solution:**
- Make sure backend is running on port 5000
- Check that `VITE_API_URL=http://localhost:5000/api` is set in frontend `.env`
- Restart both servers

### 3. Authentication Issues

**Error:** `401 Unauthorized` or `Invalid credentials`

**Solution:**
- Check that JWT_SECRET is set in backend `.env`
- Clear browser localStorage and try again
- Check backend logs for errors

### 4. Database Connection Issues

**Error:** `MongoDB connection error` in backend logs

**Solution:**
- Make sure MongoDB is running
- Check MONGODB_URI in backend `.env`
- Verify database credentials

### 5. Frontend Not Loading

**Error:** Frontend shows blank page or errors

**Solution:**
- Check browser console for errors
- Make sure all dependencies are installed (`npm install`)
- Check that Vite is running on port 5173

## Debug Mode

### Enable API Debug Logging

Add this to your frontend `src/lib/api.js`:

```javascript
// Add this at the beginning of the request method
console.log('API Request:', endpoint, options);
```

### Check Network Tab

1. Open browser dev tools (F12)
2. Go to Network tab
3. Try making API calls
4. Check if requests are being sent to the correct URL
5. Check response status and data

### Backend Logs

Check backend terminal for:
- Server startup messages
- Database connection status
- API request logs
- Error messages

## Expected Behavior

### Successful Connection

1. **Backend starts** with messages:
   ```
   🚀 PastPort API Server running on port 5000
   📱 Environment: development
   🌐 Frontend URL: http://localhost:5173
   📊 Health check: http://localhost:5000/health
   MongoDB Connected: localhost
   📅 Scheduler started - Cron jobs are running
   ```

2. **Frontend loads** without console errors

3. **Authentication works** - can register and login

4. **API calls succeed** - can create and view capsules

5. **Navigation works** - can move between pages

### Database Verification

Check your MongoDB database for:
- `users` collection with registered users
- `capsules` collection with created capsules
- `notifications` collection (may be empty initially)

## Production Testing

When deploying to production:

1. **Update environment variables** for production URLs
2. **Test with production database**
3. **Verify CORS settings** for production domain
4. **Check SSL/HTTPS** configuration
5. **Test all features** in production environment

## Support

If you're still having issues:

1. **Check the logs** in both frontend and backend
2. **Verify all environment variables** are set correctly
3. **Test API endpoints directly** with curl or Postman
4. **Check network connectivity** between frontend and backend
5. **Review the setup guides** in README.md and SETUP.md

The connection should work seamlessly once both servers are running and properly configured!
