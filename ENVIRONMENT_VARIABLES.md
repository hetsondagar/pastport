# 🔐 Environment Variables Configuration

## Overview

This document lists all environment variables needed for deploying PastPort.

---

## 📝 Backend Environment Variables (Render)

Copy these variables to Render → Environment section:

### Required Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://pastport-admin:YOUR_PASSWORD@pastport-cluster.xxxxx.mongodb.net/pastport?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-long-random-secret-key-at-least-32-characters-long
JWT_EXPIRE=7d

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name-from-cloudinary-dashboard
CLOUDINARY_API_KEY=your-api-key-from-cloudinary-dashboard
CLOUDINARY_API_SECRET=your-api-secret-from-cloudinary-dashboard

# Frontend CORS
FRONTEND_URL=https://pastport.vercel.app
FRONTEND_URLS=https://pastport.vercel.app,http://localhost:8080,http://localhost:8081

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (Optional)
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### How to Fill Each Variable

**NODE_ENV:**
- Value: `production`
- Purpose: Enables production optimizations

**PORT:**
- Value: `5000`
- Purpose: Server port (Render uses this internally)

**MONGODB_URI:**
- Get from: MongoDB Atlas → Connect → Connection String
- Format: `mongodb+srv://USER:PASS@CLUSTER.mongodb.net/pastport`
- ⚠️ Replace `<password>` with actual password
- ⚠️ Add `/pastport` database name before `?`

**JWT_SECRET:**
- Generate: Use random string generator
- Minimum: 32 characters
- Example: `kJ8mN3pQ7sT1vW4xY6zA2bC5dE8fG0hI9jK2lM5nO8pQ1rS4tU7vW0xY3zA6bC9`
- Purpose: Sign JWT tokens

**CLOUDINARY_CLOUD_NAME:**
- Get from: Cloudinary Dashboard
- Example: `pastport-cloud`

**CLOUDINARY_API_KEY:**
- Get from: Cloudinary Dashboard
- Example: `123456789012345`

**CLOUDINARY_API_SECRET:**
- Get from: Cloudinary Dashboard
- Example: `abcdefghijklmnopqrstuvwxyz123`

**FRONTEND_URL:**
- Your Vercel deployment URL
- Update AFTER Vercel deployment
- Example: `https://pastport.vercel.app`

**FRONTEND_URLS:**
- Comma-separated list
- Include production + dev URLs
- Example: `https://pastport.vercel.app,http://localhost:8080`

---

## 🌐 Frontend Environment Variables (Vercel)

Copy these variables to Vercel → Settings → Environment Variables:

### Required Variables

```bash
# Backend API URL
VITE_API_URL=https://pastport-backend.onrender.com/api
```

### How to Fill

**VITE_API_URL:**
- Get from: Render deployment URL
- Format: `https://YOUR-BACKEND.onrender.com/api`
- ⚠️ Must include `/api` at the end!
- Example: `https://pastport-backend-abc123.onrender.com/api`

**Important:**
- Name must start with `VITE_` for Vite to include it
- Value must be your actual Render backend URL
- Include `/api` suffix

---

## 🔑 How to Generate JWT_SECRET

### Option 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: Online Generator
- Go to: https://randomkeygen.com
- Use "CodeIgniter Encryption Keys" section
- Copy the 256-bit key

### Option 3: Manual
Type random characters (min 32):
```
kJ8mN3pQ7sT1vW4xY6zA2bC5dE8fG0hI9jK2lM5nO8pQ1rS4tU7vW0xY3zA6bC9dE2fG5hI8
```

---

## 📋 Environment Variables Template

### For Render (Copy and Fill)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
FRONTEND_URLS=
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EMAIL_ENABLED=false
```

### For Vercel (Copy and Fill)

```env
VITE_API_URL=
```

---

## 🔍 Verification Steps

### Test MongoDB Connection
```bash
# Use MongoDB Compass or mongosh
mongosh "mongodb+srv://pastport-admin:PASSWORD@cluster.mongodb.net/pastport"
```

Should connect successfully.

### Test Cloudinary
```bash
curl -X POST https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload \
  -F "file=@test.jpg" \
  -F "api_key=YOUR_API_KEY" \
  -F "timestamp=$(date +%s)" \
  -F "signature=..."
```

Should upload successfully.

### Test Backend
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

### Test Frontend
Open in browser:
```
https://pastport.vercel.app
```

Should load without errors.

---

## ⚠️ Security Notes

### DO NOT:
- ❌ Commit `.env` files to Git
- ❌ Share environment variables publicly
- ❌ Use weak JWT secrets
- ❌ Hardcode secrets in code

### DO:
- ✅ Use strong, random JWT secrets
- ✅ Keep MongoDB user password secure
- ✅ Use environment variables on platforms
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate secrets if compromised

---

## 📦 Platform-Specific Notes

### Render
- Free tier spins down after 15min inactivity
- First request takes 30-60 seconds (cold start)
- Subsequent requests are fast
- Auto-deploys on git push

### Vercel
- Instant deploys
- Always active (no spin down)
- Global CDN
- Auto-deploys on git push

### MongoDB Atlas
- Free tier: 512MB storage
- Shared cluster
- Auto-scaling not available
- Backups not included in free tier

### Cloudinary
- Free tier: 25GB storage, 25GB bandwidth
- Auto-optimization
- Global CDN
- Transformations included

---

## 🔄 Updating Variables

### On Render:
1. Go to service dashboard
2. Click "Environment"
3. Edit variable
4. Click "Save"
5. Service auto-redeploys

### On Vercel:
1. Go to project settings
2. Click "Environment Variables"
3. Edit/Add variable
4. Redeploy from Deployments tab

---

## ✅ Verification Checklist

**Before deploying:**
- [ ] All 11 backend env vars ready
- [ ] 1 frontend env var ready
- [ ] MongoDB connection string tested
- [ ] Cloudinary credentials verified
- [ ] JWT secret generated (32+ chars)

**After deploying:**
- [ ] Backend health check passes
- [ ] Frontend loads
- [ ] Can register user
- [ ] Can login
- [ ] Can create capsule
- [ ] Can upload media
- [ ] MongoDB stores data
- [ ] Cloudinary receives files

---

## 🎊 Ready to Deploy!

Once all environment variables are prepared:
1. Add them to Render
2. Add them to Vercel
3. Deploy both platforms
4. Test complete flow
5. Share your app!

**Your environment is configured!** 🚀✨

---

## 📞 Support

**If env vars are incorrect:**
- Check spelling and format
- Verify no extra spaces
- Ensure URLs include protocols (https://)
- Test each service independently

**Example Working Set:**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pastport
JWT_SECRET=kJ8mN3pQ7sT1vW4xY6zA2bC5dE8fG0hI
CLOUDINARY_CLOUD_NAME=pastport-cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnop
FRONTEND_URL=https://pastport.vercel.app
VITE_API_URL=https://pastport-backend.onrender.com/api
```

**All set! Start deploying!** 🎉

