# How to Test the Backend

## Prerequisites
- Backend server running on `http://localhost:5000`
- MongoDB connected and running
- Node.js and npm installed

## Option 1: Run Comprehensive API Tests

### Using the Test Script

```bash
# Make sure you're in the backend directory
cd backend

# Install node-fetch if not already installed
npm install node-fetch

# Run the comprehensive test script
node test-all-endpoints.js
```

This will test:
- ✅ Authentication (register, login, get user)
- ✅ Journal Entries (create, read, update, month fetch)
- ✅ Time Capsules (create, read, stats)
- ✅ Lottery System (get capsule, history)
- ✅ User Profile (get, update, streak)
- ✅ Notifications (get, unread count)

**Expected Output:**
```
🚀 Starting Comprehensive Backend API Tests...
==================================================

📋 TESTING AUTHENTICATION...
✅ PASS - Register User: Status: 201
✅ PASS - Login User: Status: 200
✅ PASS - Get Current User: Status: 200

📔 TESTING JOURNAL ENTRIES...
✅ PASS - Create Journal Entry: Status: 201
✅ PASS - Get Month Entries: Status: 200, Entries: 1
✅ PASS - Get Journal Streak: Streak: 1 days
...

📊 TEST SUMMARY
Total Tests: 18
✅ Passed: 18
❌ Failed: 0
Success Rate: 100.0%
```

---

## Option 2: Manual Testing with curl

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
Save the token from the response!

### 4. Create Journal Entry
```bash
curl -X POST http://localhost:5000/api/journal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "Today was amazing!",
    "mood": "happy",
    "date": "2025-01-15T10:00:00Z"
  }'
```

### 5. Get Month Entries (for Constellation)
```bash
curl http://localhost:5000/api/journal/USER_ID/month/2025/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Get Lottery Capsule
```bash
curl http://localhost:5000/api/lottery \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Option 3: Use Postman or Thunder Client

### Import Collection
1. Open Postman or Thunder Client
2. Create new requests for each endpoint
3. Set base URL: `http://localhost:5000/api`
4. Add `Authorization: Bearer {{token}}` header

### Test Sequence:
1. `POST /auth/register` - Get token
2. `POST /journal` - Create entry
3. `GET /journal/:userId/month/:year/:month` - Fetch for constellation
4. `GET /lottery` - Get lottery capsule
5. `GET /capsules/stats` - Get statistics

---

## Option 4: Use the Frontend

### Best Way to Test Integration:

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Features**:
   - ✅ Register/Login → Check if auth works
   - ✅ Go to Journal → Create entries
   - ✅ Go to Constellation → See if entries appear as stars
   - ✅ Create Capsule → Verify it's saved
   - ✅ Check Dashboard → See stats update
   - ✅ View Lottery Widget → Check lottery system

4. **Open Browser Console (F12)**:
   - Check Network tab for API calls
   - Look for 200/201 status codes
   - Verify data structure

---

## Verify Database Directly

### Using MongoDB Compass or mongosh:

```javascript
// Connect to database
use pastport

// Check collections
show collections

// View journal entries
db.journalentries.find().pretty()

// Check if entry was created
db.journalentries.findOne({ content: /Today was amazing/ })

// View all users
db.users.find().pretty()

// Check lottery capsules
db.lotterycapsules.find().pretty()

// View capsules
db.capsules.find().pretty()
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
# Windows: Run MongoDB service
# Mac/Linux: sudo systemctl start mongod
```

### Issue: "401 Unauthorized"
**Solution:** Make sure you're passing the JWT token in the Authorization header

### Issue: "No entries found"
**Solution:** Create some journal entries first using the Journal page or API

### Issue: "Constellation shows no stars"
**Solution:** 
1. Check if journal entries exist for that month
2. Open browser console and check API response
3. Verify `/api/journal/:userId/month/:year/:month` returns data

---

## Quick Verification Checklist

- [ ] Backend server running on port 5000
- [ ] MongoDB connected (check server logs)
- [ ] Can register new user
- [ ] Can login and get JWT token
- [ ] Can create journal entry
- [ ] Can fetch month entries
- [ ] Can create time capsule
- [ ] Can get lottery capsule
- [ ] Can get user statistics
- [ ] Constellation displays journal entries as stars

---

## Test Results Location

After running tests, check:
- **Console Output** - Test results summary
- **Server Logs** - backend/logs/
- **Database** - MongoDB collections
- **Browser DevTools** - Network tab for frontend tests

---

## Need Help?

1. Check `BACKEND_VERIFICATION.md` for complete backend status
2. Review server logs in `backend/logs/`
3. Open browser console (F12) for frontend errors
4. Check MongoDB connection in server startup logs

---

**All tests passing = Backend is working correctly! ✅**

