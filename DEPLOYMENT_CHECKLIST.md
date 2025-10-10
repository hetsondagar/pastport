# ✅ Deployment Checklist - Complete Step-by-Step

Follow this checklist in order. Don't skip steps!

---

## 🎯 PHASE 1: Pre-Deployment Preparation (15 minutes)

### ☁️ 1. MongoDB Atlas Setup

- [ ] Go to https://cloud.mongodb.com
- [ ] Sign up / Login
- [ ] Create new project: "PastPort"
- [ ] Create FREE cluster (M0)
  - Region: Singapore/Mumbai
  - Name: `pastport-cluster`
- [ ] Create database user:
  - Username: `pastport-admin`
  - Password: (generate strong password - **SAVE IT!**)
  - Role: "Read and write to any database"
- [ ] Whitelist IP: Add `0.0.0.0/0` (allow from anywhere)
- [ ] Get connection string:
  ```
  mongodb+srv://pastport-admin:PASSWORD@pastport-cluster.xxxxx.mongodb.net/pastport
  ```
- [ ] **SAVE THIS STRING!**

### ☁️ 2. Cloudinary Setup

- [ ] Go to https://cloudinary.com
- [ ] Sign up (free tier)
- [ ] Verify email
- [ ] Go to Dashboard
- [ ] Copy these 3 values:
  - [ ] Cloud Name: `________________`
  - [ ] API Key: `________________`
  - [ ] API Secret: `________________`
- [ ] **SAVE THESE!**

### 📦 3. GitHub Repository

- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Ready for deployment"
  ```
- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```
- [ ] Verify code is on GitHub
- [ ] **SAVE REPO URL!**

---

## 🎯 PHASE 2: Backend Deployment (15 minutes)

### 🖥️ 4. Render Setup

- [ ] Go to https://render.com
- [ ] Sign up / Login with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Select `pastport` repo

### 🖥️ 5. Render Configuration

- [ ] **Name:** `pastport-backend`
- [ ] **Region:** `Singapore`
- [ ] **Branch:** `main`
- [ ] **Root Directory:** `backend`
- [ ] **Runtime:** `Node`
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `npm start`
- [ ] **Instance Type:** `Free`

### 🔐 6. Render Environment Variables

Click "Environment" → Add each variable:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGODB_URI` = (paste your MongoDB connection string)
- [ ] `JWT_SECRET` = (generate random 32+ char string)
- [ ] `CLOUDINARY_CLOUD_NAME` = (from Cloudinary dashboard)
- [ ] `CLOUDINARY_API_KEY` = (from Cloudinary dashboard)
- [ ] `CLOUDINARY_API_SECRET` = (from Cloudinary dashboard)
- [ ] `FRONTEND_URL` = `https://pastport.vercel.app` (temporary)
- [ ] `RATE_LIMIT_WINDOW_MS` = `900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS` = `100`
- [ ] `EMAIL_ENABLED` = `false`

### 🚀 7. Deploy Backend

- [ ] Click "Create Web Service"
- [ ] Wait 5-10 minutes for deployment
- [ ] Check logs for "MongoDB Connected"
- [ ] Note your backend URL:
  ```
  https://pastport-backend-XXXX.onrender.com
  ```
- [ ] **SAVE THIS URL!**

### ✅ 8. Test Backend

- [ ] Open in browser:
  ```
  https://pastport-backend-XXXX.onrender.com/health
  ```
- [ ] Should see:
  ```json
  {
    "success": true,
    "message": "PastPort API is running"
  }
  ```
- [ ] ✅ Backend is live!

---

## 🎯 PHASE 3: Frontend Deployment (10 minutes)

### 🌐 9. Vercel Setup

- [ ] Go to https://vercel.com
- [ ] Sign up / Login with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Import your `pastport` repository

### 🌐 10. Vercel Configuration

- [ ] **Framework Preset:** `Vite`
- [ ] **Root Directory:** `frontend`
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`
- [ ] **Install Command:** `npm install`

### 🔐 11. Vercel Environment Variables

Click "Environment Variables":

- [ ] `VITE_API_URL` = `https://pastport-backend-XXXX.onrender.com/api`
  - ⚠️ Use YOUR actual Render backend URL!
  - Include `/api` at the end!

### 🚀 12. Deploy Frontend

- [ ] Click "Deploy"
- [ ] Wait 2-5 minutes
- [ ] Note your frontend URL:
  ```
  https://pastport-XXXX.vercel.app
  ```
- [ ] **SAVE THIS URL!**

### ✅ 13. Test Frontend

- [ ] Open in browser:
  ```
  https://pastport-XXXX.vercel.app
  ```
- [ ] Should see PastPort landing page
- [ ] ✅ Frontend is live!

---

## 🎯 PHASE 4: Final Integration (5 minutes)

### 🔄 14. Update Backend CORS

- [ ] Go back to Render dashboard
- [ ] Select your backend service
- [ ] Go to "Environment"
- [ ] Update `FRONTEND_URL`:
  - [ ] Delete old value
  - [ ] Add: `https://pastport-XXXX.vercel.app` (your actual Vercel URL)
- [ ] Add `FRONTEND_URLS`:
  - [ ] Value: `https://pastport-XXXX.vercel.app,http://localhost:8080,http://localhost:8081`
- [ ] Click "Save"
- [ ] Render will auto-redeploy (~2 minutes)

### ✅ 15. Final Testing

- [ ] Open your Vercel app:
  ```
  https://pastport-XXXX.vercel.app
  ```
- [ ] **Test Registration:**
  - [ ] Click "Get Started"
  - [ ] Register new account
  - [ ] Login successful ✅

- [ ] **Test Capsule Creation:**
  - [ ] Navigate to "Create Capsule"
  - [ ] Fill form
  - [ ] Select unlock date
  - [ ] Click "Create Capsule"
  - [ ] Success message appears ✅

- [ ] **Test Media Upload:**
  - [ ] Create new capsule
  - [ ] Scroll to "Media Attachments"
  - [ ] Upload an image
  - [ ] See upload success ✅

- [ ] **Test Dashboard:**
  - [ ] Go to Dashboard
  - [ ] See your capsules
  - [ ] Click a capsule
  - [ ] Modal opens ✅

- [ ] **Test Constellation:**
  - [ ] Go to Memory Constellation
  - [ ] See 3D stars
  - [ ] No errors ✅

---

## 🎉 DEPLOYMENT COMPLETE!

If all checkboxes are checked, your app is successfully deployed!

### Your Live URLs:
```
Frontend: https://pastport-XXXX.vercel.app
Backend:  https://pastport-backend-XXXX.onrender.com
Database: MongoDB Atlas (connected)
Media:    Cloudinary (configured)
```

### Share Your App:
✅ Send frontend URL to anyone
✅ They can register and use it
✅ Fully functional web app
✅ Portfolio-ready project!

---

## 📊 Deployment Summary

**Total Time:** ~45 minutes
**Total Cost:** $0/month (free tiers)
**Services Used:** 4 (Vercel, Render, MongoDB, Cloudinary)
**Configuration Files:** 2 (vercel.json, render.yaml)
**Environment Variables:** 12 total

---

## 🔄 Future Updates

**To deploy new features:**

```bash
# 1. Make changes locally
# 2. Test locally
# 3. Commit and push
git add .
git commit -m "New feature"
git push origin main

# 4. Automatic deployment
# - Vercel deploys frontend (30 seconds)
# - Render deploys backend (2-3 minutes)
# - Both automatically!
```

---

## 🆘 Need Help?

**If anything fails:**
1. Check deployment logs on Render/Vercel
2. Verify environment variables are correct
3. Test backend health endpoint
4. Check MongoDB Atlas connection
5. Verify Cloudinary credentials

**Common Issues:**
- CORS errors → Check FRONTEND_URL matches
- 503 errors → Render is cold starting (wait 30 sec)
- Upload fails → Check Cloudinary credentials
- DB errors → Verify MongoDB URI and whitelist

---

## 🎊 Congratulations!

You've successfully deployed a full-stack MERN application with:
- ✅ React + TypeScript frontend
- ✅ Node.js + Express backend
- ✅ MongoDB Atlas database
- ✅ Cloudinary media storage
- ✅ JWT authentication
- ✅ Real-time 3D visualization
- ✅ Media upload system
- ✅ Time capsule features
- ✅ Production deployment

**This is a portfolio-worthy, professional-grade application!** 🏆

---

**Ready to deploy? Start with Phase 1!** 🚀

