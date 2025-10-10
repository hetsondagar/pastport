# 🚀 Complete Deployment Guide - PastPort

## Deployment Stack
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Media Storage:** Cloudinary

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Render account (free)
- [ ] MongoDB Atlas account (free)
- [ ] Cloudinary account (free)
- [ ] Git repository with your code

---

## 🗄️ PART 1: MongoDB Atlas Setup

### Step 1: Create Database

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Sign up/Login**
3. **Create New Project:**
   - Project Name: `PastPort`
   - Click "Create Project"

4. **Create Cluster:**
   - Click "Build a Database"
   - Choose **FREE** tier (M0)
   - Select region closest to you (e.g., Mumbai for India)
   - Cluster Name: `pastport-cluster`
   - Click "Create"

### Step 2: Configure Database Access

1. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `pastport-admin`
   - Password: Generate a strong password (SAVE THIS!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

2. **Whitelist IP Addresses:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm
   - ⚠️ This is required for Render to connect

### Step 3: Get Connection String

1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Driver: **Node.js**
4. Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://pastport-admin:<password>@pastport-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name after `.net/`:
   ```
   mongodb+srv://pastport-admin:YOUR_PASSWORD@pastport-cluster.xxxxx.mongodb.net/pastport?retryWrites=true&w=majority
   ```

**SAVE THIS CONNECTION STRING!** You'll need it for Render.

---

## ☁️ PART 2: Cloudinary Setup

### Step 1: Create Account

1. **Go to:** https://cloudinary.com
2. **Sign up** (free tier - 25GB storage)
3. Verify email

### Step 2: Get Credentials

1. Go to **Dashboard**
2. Copy these 3 values:
   ```
   Cloud Name: your-cloud-name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz
   ```

**SAVE THESE!** You'll need them for Render.

---

## 🖥️ PART 3: Render (Backend) Deployment

### Step 1: Prepare Backend

1. **Ensure these files exist in your repo:**
   - ✅ `backend/package.json`
   - ✅ `backend/server.js`
   - ✅ All models, routes, controllers

2. **Check package.json has start script:**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

### Step 2: Push to GitHub

```bash
# If not already in a git repo
git init
git add .
git commit -m "Complete PastPort with media system"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pastport.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to:** https://render.com
2. **Sign up/Login** (use GitHub)
3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select your `pastport` repo

4. **Configure Service:**
   ```
   Name: pastport-backend
   Region: Singapore (closest to India)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Add Environment Variables:**
   Click "Environment" → "Add Environment Variable"
   
   Add ALL of these:
   ```
   NODE_ENV=production
   PORT=5000
   
   # MongoDB Atlas (from Part 1)
   MONGODB_URI=mongodb+srv://pastport-admin:YOUR_PASSWORD@pastport-cluster.xxxxx.mongodb.net/pastport?retryWrites=true&w=majority
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-long-random-secret-key-minimum-32-characters
   
   # Cloudinary (from Part 2)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Frontend URL (we'll update this after Vercel deployment)
   FRONTEND_URL=https://pastport.vercel.app
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Email (optional)
   EMAIL_ENABLED=false
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build
   - You'll get a URL like: `https://pastport-backend.onrender.com`

7. **Test Backend:**
   ```bash
   curl https://pastport-backend.onrender.com/health
   ```
   
   Should return:
   ```json
   {
     "success": true,
     "message": "PastPort API is running"
   }
   ```

**SAVE YOUR BACKEND URL!** You'll need it for frontend.

---

## 🌐 PART 4: Vercel (Frontend) Deployment

### Step 1: Prepare Frontend

1. **Create `vercel.json` in frontend folder:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. **Update frontend/.env:**
   ```
   VITE_API_URL=https://pastport-backend.onrender.com/api
   ```

3. **Check package.json has build script:**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview"
     }
   }
   ```

### Step 2: Deploy on Vercel

1. **Go to:** https://vercel.com
2. **Sign up/Login** (use GitHub)
3. **Import Project:**
   - Click "Add New" → "Project"
   - Import your GitHub repo
   - Select `pastport`

4. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Add Environment Variables:**
   Click "Environment Variables" tab
   
   Add:
   ```
   VITE_API_URL=https://pastport-backend.onrender.com/api
   ```
   
   ⚠️ Replace with YOUR actual Render backend URL!

6. **Deploy:**
   - Click "Deploy"
   - Wait 2-5 minutes
   - You'll get a URL like: `https://pastport.vercel.app`

### Step 3: Update Backend CORS

1. **Go back to Render**
2. **Edit Environment Variables**
3. **Update FRONTEND_URL:**
   ```
   FRONTEND_URL=https://pastport.vercel.app
   ```
   (Use your actual Vercel URL)

4. **Render will auto-redeploy**

---

## 🔄 PART 5: Final Configuration

### Update Both Platforms

**Render (Backend):**
```
FRONTEND_URL=https://pastport.vercel.app
FRONTEND_URLS=https://pastport.vercel.app,http://localhost:8080,http://localhost:8081
```

**Vercel (Frontend):**
```
VITE_API_URL=https://pastport-backend.onrender.com/api
```

### Test Complete Flow

1. **Visit:** `https://pastport.vercel.app`
2. **Register Account**
3. **Create Capsule**
4. **Upload Media** (image/video/audio)
5. **View on Dashboard**
6. **Unlock and view**

---

## 🐛 Troubleshooting

### Issue: CORS Error
**Symptom:** "Blocked by CORS policy"
**Solution:**
- Check `FRONTEND_URL` on Render matches Vercel URL
- Include both production and dev URLs in `FRONTEND_URLS`
- Redeploy backend

### Issue: MongoDB Connection Failed
**Symptom:** "Failed to connect to database"
**Solution:**
- Verify MongoDB URI is correct
- Check password has no special characters or is URL-encoded
- Ensure IP whitelist includes 0.0.0.0/0
- Check cluster is running

### Issue: Media Upload Fails
**Symptom:** "Upload failed" or "Cloudinary error"
**Solution:**
- Verify all 3 Cloudinary env vars are set
- Check credentials are correct
- Ensure Cloudinary account is active
- Check file size < 20MB

### Issue: 503 Service Unavailable (Render)
**Symptom:** Backend not responding
**Solution:**
- Render free tier spins down after inactivity
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast

### Issue: Build Failed (Vercel)
**Symptom:** "Build failed" error
**Solution:**
- Check `package.json` has `build` script
- Ensure all dependencies are in `dependencies` not `devDependencies`
- Check TypeScript types are correct
- Review build logs for specific errors

---

## 📊 Environment Variables Summary

### Backend (Render)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://pastport.vercel.app
FRONTEND_URLS=https://pastport.vercel.app,http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EMAIL_ENABLED=false
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://pastport-backend.onrender.com/api
```

---

## 🔐 Security Checklist

- [x] JWT_SECRET is long and random
- [x] MongoDB user has limited permissions
- [x] CORS configured for specific origins
- [x] Rate limiting enabled
- [x] Input validation active
- [x] File upload size limits
- [x] Authentication on all routes
- [x] XSS protection enabled
- [x] MongoDB sanitization active

---

## 📈 Performance Tips

### Render Free Tier
- Spins down after 15 min inactivity
- First request takes ~30 seconds (cold start)
- Use cron job to keep alive (optional)

### Vercel
- Instant deploys
- Global CDN
- Always fast

### MongoDB Atlas
- Free tier: 512MB storage
- Connection pooling enabled
- Indexes for fast queries

### Cloudinary
- Free tier: 25GB storage, 25GB bandwidth/month
- Auto-optimization enabled
- Global CDN delivery

---

## 🎯 Deployment Workflow

### For Future Updates

```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Your changes"

# 4. Push to GitHub
git push origin main

# 5. Auto-deployment
# - Vercel deploys frontend automatically
# - Render deploys backend automatically

# 6. Verify
# Visit your Vercel URL
# Test features
```

---

## 📱 Access URLs

After deployment, you'll have:

- **Frontend:** `https://pastport.vercel.app`
- **Backend:** `https://pastport-backend.onrender.com`
- **Backend Health:** `https://pastport-backend.onrender.com/health`
- **API Docs:** `https://pastport-backend.onrender.com/api-docs`
- **Database:** MongoDB Atlas (private)
- **Media CDN:** Cloudinary (public URLs)

---

## ✅ Post-Deployment Verification

### Test 1: Health Check
```bash
curl https://pastport-backend.onrender.com/health
```

### Test 2: Frontend Loads
Visit: `https://pastport.vercel.app`
Should see landing page

### Test 3: Register User
Try creating an account on your deployed app

### Test 4: Create Capsule
Create a time capsule with media

### Test 5: Upload Media
Upload an image and verify it appears on Cloudinary

---

## 💰 Cost Summary

### Free Tier Limits

**Vercel:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Free SSL
- ✅ Global CDN

**Render:**
- ✅ 750 hours/month free
- ⚠️ Spins down after 15min inactivity
- ✅ 512MB RAM
- ✅ Free SSL

**MongoDB Atlas:**
- ✅ 512MB storage
- ✅ Unlimited connections
- ✅ Shared cluster

**Cloudinary:**
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ 25k transformations

**Total Cost:** **$0/month** for small-medium usage! 🎉

---

## 🔧 Advanced: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `pastport.com`)
4. Follow DNS configuration steps
5. Free SSL included

### Update Environment Variables

**Render:**
```
FRONTEND_URL=https://pastport.com
```

---

## 🎊 Success!

After completing all steps, your PastPort app is:
- ✅ **Deployed globally**
- ✅ **Accessible from anywhere**
- ✅ **Secure (HTTPS)**
- ✅ **Scalable**
- ✅ **Free to run**
- ✅ **Professional grade**

**Share your deployed app:**
`https://pastport.vercel.app` 🚀✨

---

**Deployment Time:** ~30-45 minutes total
**Difficulty:** Beginner-friendly
**Cost:** $0/month
**Result:** Production-ready app!

