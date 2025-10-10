# 💻 Deployment Commands Reference

Quick copy-paste commands for deploying PastPort.

---

## 📦 Initial Setup

### 1. Prepare Repository
```bash
# Navigate to project root
cd pastport

# Ensure everything is committed
git status

# Add all changes
git add .

# Commit
git commit -m "Ready for deployment with media system"

# Push to GitHub
git push origin main
```

---

## 🧪 Pre-Deployment Testing

### Test Backend Locally
```bash
cd backend

# Install dependencies
npm install

# Start server
npm run dev

# In another terminal, test health
curl http://localhost:5000/health
```

### Test Frontend Locally
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Visit: http://localhost:8080
```

### Test Production Build (Frontend)
```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview

# Visit: http://localhost:4173
```

---

## ☁️ Cloudinary Commands

### Test Cloudinary Connection
```bash
# Using curl
curl -X POST "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload" \
  -F "file=@test.jpg" \
  -F "upload_preset=YOUR_PRESET"
```

### Generate Cloudinary Upload Preset (Optional)
1. Cloudinary Dashboard → Settings
2. Upload → Upload Presets
3. Add upload preset
4. Name: `pastport-uploads`
5. Signing Mode: Unsigned

---

## 🗄️ MongoDB Commands

### Connect to Atlas
```bash
# Using mongosh
mongosh "mongodb+srv://pastport-admin:PASSWORD@cluster.mongodb.net/pastport"
```

### Verify Collections
```javascript
// In mongosh
use pastport
show collections

// Should show:
// - users
// - capsules
// - journalentries
// - lotterycapsules
// - media
// - notifications
```

### Check Data
```javascript
// Count users
db.users.countDocuments()

// View recent capsules
db.capsules.find().sort({createdAt: -1}).limit(5)

// Check media uploads
db.media.find()
```

---

## 🖥️ Render Deployment Commands

### Using Render CLI (Optional)
```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy

# View logs
render logs pastport-backend
```

### Using Git (Recommended)
```bash
# Push to GitHub
git push origin main

# Render auto-deploys
# Check dashboard for progress
```

---

## 🌐 Vercel Deployment Commands

### Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

### Using Git (Recommended)
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# Check dashboard for progress
```

---

## 🔍 Testing Deployed Backend

### Health Check
```bash
curl https://pastport-backend.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "PastPort API is running",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "environment": "production"
}
```

### Test Registration
```bash
curl -X POST https://pastport-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST https://pastport-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🔍 Testing Deployed Frontend

### Check Build
```bash
# Visit in browser
https://pastport.vercel.app

# Check console (F12)
# Should have no errors
```

### Test API Connection
```javascript
// In browser console
fetch('https://pastport-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)

// Should return health check response
```

---

## 🐛 Debugging Commands

### View Render Logs (Real-time)
```bash
# In Render dashboard
# Click service → Logs tab
# Or use CLI:
render logs pastport-backend --tail
```

### View Vercel Logs
```bash
# Using CLI
vercel logs

# Or visit dashboard:
# Project → Deployments → Click deployment → Logs
```

### Check MongoDB Connection
```bash
# Test connection string
mongosh "YOUR_MONGODB_URI"

# If successful, you're connected
# If fails, check:
# - Password correct
# - IP whitelisted
# - URI format correct
```

### Test Cloudinary Upload
```bash
# Create test upload
curl -X POST https://pastport-backend.onrender.com/api/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.jpg" \
  -F "entryType=capsule"
```

---

## 🔄 Redeployment Commands

### Redeploy Backend (Render)
```bash
# Method 1: Git push (triggers auto-deploy)
git push origin main

# Method 2: Manual redeploy on dashboard
# Render → Service → Manual Deploy → Deploy Latest Commit

# Method 3: Using CLI
render deploy
```

### Redeploy Frontend (Vercel)
```bash
# Method 1: Git push (triggers auto-deploy)
git push origin main

# Method 2: Manual redeploy on dashboard
# Vercel → Deployments → Redeploy

# Method 3: Using CLI
vercel --prod
```

---

## 🎯 Production Checklist Commands

### Backend Health
```bash
curl https://pastport-backend.onrender.com/health
# ✅ Should return success

curl https://pastport-backend.onrender.com/api-docs
# ✅ Should show Swagger docs
```

### Frontend Health
```bash
# Visit in browser
https://pastport.vercel.app
# ✅ Should load landing page

# Check API connection
curl https://pastport.vercel.app
# ✅ Should return HTML
```

### Database Health
```bash
mongosh "YOUR_MONGODB_URI" --eval "db.adminCommand('ping')"
# ✅ Should return { ok: 1 }
```

### Cloudinary Health
```bash
# Upload test file
curl -X POST "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload" \
  -F "file=@test.jpg" \
  -F "api_key=YOUR_API_KEY" \
  -F "timestamp=$(date +%s)" \
  -F "signature=..."
# ✅ Should return upload response
```

---

## 📈 Monitoring Commands

### Watch Backend Logs
```bash
# Using Render CLI
render logs pastport-backend --tail

# Or visit:
# https://dashboard.render.com → Service → Logs
```

### Check Vercel Deployment Status
```bash
# Using Vercel CLI
vercel ls

# Show recent deployments
vercel list
```

### Monitor MongoDB
```bash
# Check current connections
mongosh "YOUR_MONGODB_URI" --eval "db.serverStatus().connections"

# Check database size
mongosh "YOUR_MONGODB_URI" --eval "db.stats()"
```

---

## 🧹 Cleanup Commands (If Needed)

### Remove Vercel Deployment
```bash
vercel rm pastport --yes
```

### Remove Render Service
```bash
# Dashboard → Service → Settings → Delete Service
```

### Clear MongoDB Database
```javascript
// Connect to mongosh
use pastport
db.dropDatabase()
```

---

## 🔐 Environment Variable Commands

### Set Render Environment Variable
```bash
# Using dashboard (recommended)
# or CLI:
render env set KEY=value --service pastport-backend
```

### Set Vercel Environment Variable
```bash
# Using dashboard (recommended)
# or CLI:
vercel env add VITE_API_URL production
```

### View All Environment Variables
```bash
# Render
render env ls

# Vercel
vercel env ls
```

---

## 📊 Useful Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Quick deploy
alias deploy-backend="cd backend && git push origin main"
alias deploy-frontend="cd frontend && git push origin main"
alias deploy-all="git push origin main"

# Quick logs
alias logs-backend="render logs pastport-backend --tail"
alias logs-frontend="vercel logs"

# Quick test
alias test-backend="curl https://pastport-backend.onrender.com/health"
alias test-frontend="curl https://pastport.vercel.app"
```

---

## 🎉 Success Commands

### Verify Deployment
```bash
# All-in-one test script
echo "Testing Backend..."
curl -s https://pastport-backend.onrender.com/health | jq .

echo "Testing Frontend..."
curl -s https://pastport.vercel.app -I | grep "200 OK"

echo "Testing MongoDB..."
mongosh "YOUR_MONGODB_URI" --eval "db.adminCommand('ping')" --quiet

echo "✅ All systems operational!"
```

---

## 📝 Notes

**Cold Start (Render):**
- Free tier spins down after 15min
- First request takes 30-60 seconds
- Keep warm with cron job (optional)

**Build Time:**
- Backend: ~2-3 minutes
- Frontend: ~1-2 minutes
- Total: ~5 minutes per deploy

**Auto-Deploy:**
- Both platforms deploy on git push
- No manual action needed
- Check dashboards for status

---

**Ready to deploy? Copy and paste these commands!** 🚀

**Start with:** `QUICK_DEPLOY.md`

