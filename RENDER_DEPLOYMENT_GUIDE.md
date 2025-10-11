# 🚀 Complete Render Deployment Guide for PastPort

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Getting API Keys](#getting-api-keys)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Cloudinary Setup](#cloudinary-setup)
5. [Gmail SMTP Setup](#gmail-smtp-setup)
6. [Deploying to Render](#deploying-to-render)
7. [Environment Variables](#environment-variables)
8. [Frontend Deployment](#frontend-deployment)
9. [Testing Deployment](#testing-deployment)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with your PastPort repository
- ✅ Render account (free tier works fine)
- ✅ MongoDB Atlas account
- ✅ Cloudinary account (free tier)
- ✅ Gmail account for sending emails

---

## Getting API Keys

### 1. MongoDB Atlas Setup 🗄️

**Step 1: Create Account**
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Start Free"
3. Sign up with your email or Google account

**Step 2: Create Cluster**
1. Choose "Shared" (Free tier)
2. Select your preferred cloud provider and region (closest to you)
3. Cluster name: `pastport-cluster` (or any name)
4. Click "Create Cluster"

**Step 3: Create Database User**
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `pastport-admin` (or any username)
5. Generate a secure password (SAVE THIS!)
6. User Privileges: "Read and write to any database"
7. Click "Add User"

**Step 4: Whitelist IP Address**
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access From Anywhere" (for Render)
4. Confirm (IP: `0.0.0.0/0`)

**Step 5: Get Connection String**
1. Go to "Database" → Click "Connect"
2. Choose "Connect your application"
3. Driver: Node.js, Version: Latest
4. Copy the connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add database name: `/pastport`

**Final MongoDB URI**:
```
mongodb+srv://pastport-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pastport?retryWrites=true&w=majority
```

---

### 2. Cloudinary Setup ☁️

**Step 1: Create Account**
1. Go to https://cloudinary.com
2. Click "Sign Up for Free"
3. Complete registration

**Step 2: Get API Credentials**
1. After login, go to Dashboard
2. You'll see:
   - **Cloud Name**: (e.g., `dxxxxxxxxxxxx`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: Click "reveal" to see it

**Copy These Values:**
```
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-secret-here
```

**Step 3: Configure Upload Preset (Optional)**
1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Preset name: `pastport_media`
5. Signing mode: `signed`
6. Folder: `pastport`
7. Click "Save"

---

### 3. Gmail SMTP Setup 📧

**Step 1: Enable 2-Factor Authentication**
1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google"
3. Click "2-Step Verification"
4. Follow setup process

**Step 2: Generate App Password**
1. Stay on Security page
2. Click "App passwords" (appears after 2FA is enabled)
3. Select app: "Mail"
4. Select device: "Other (Custom name)"
5. Name: `PastPort App`
6. Click "Generate"
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
8. **IMPORTANT**: Remove spaces when using it

**Gmail SMTP Configuration:**
```
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop  (no spaces)
```

**Alternative Email Providers:**

- **SendGrid**: https://sendgrid.com (100 emails/day free)
- **Mailgun**: https://www.mailgun.com (5,000 emails/month free)
- **AWS SES**: https://aws.amazon.com/ses/ (62,000 emails/month free)

---

## Deploying to Render

### Backend Deployment

**Step 1: Create Web Service**
1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your `pastport` repository

**Step 2: Configure Service**
```
Name: pastport-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

**Step 3: Add Environment Variables**
Click "Advanced" → "Add Environment Variable"

Add all these variables (see next section for complete list)

**Step 4: Deploy**
1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Note your backend URL: `https://pastport-backend.onrender.com`

---

## Environment Variables

### Complete List for Render

Copy and paste these into Render's Environment Variables section:

#### 🔐 Essential Variables

```bash
# Node Environment
NODE_ENV=production

# Port (Render sets this automatically)
PORT=10000

# MongoDB Connection
MONGODB_URI=mongodb+srv://pastport-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pastport?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-random-string

# Frontend URL (Update after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app
```

#### 📧 Email Configuration

```bash
# Email Settings
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

#### ☁️ Cloudinary Configuration

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

#### 🔧 Optional Variables

```bash
# Database Name (optional, included in URI)
DB_NAME=pastport

# CORS Origins (optional, defaults to all)
CORS_ORIGIN=https://your-app.vercel.app

# Session Secret (optional)
SESSION_SECRET=another-random-secret-string

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### How to Generate Secure Secrets

**Method 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 2: Online Generator**
- Go to https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" or "Fort Knox Passwords"

**Method 3: OpenSSL (Linux/Mac)**
```bash
openssl rand -hex 32
```

---

## Environment Variables Reference Table

| Variable | Required | Example | Where to Get |
|----------|----------|---------|--------------|
| `NODE_ENV` | ✅ | `production` | Set manually |
| `PORT` | ✅ | `10000` | Auto-set by Render |
| `MONGODB_URI` | ✅ | `mongodb+srv://...` | MongoDB Atlas |
| `JWT_SECRET` | ✅ | `random-string` | Generate yourself |
| `FRONTEND_URL` | ✅ | `https://app.vercel.app` | After frontend deploy |
| `EMAIL_ENABLED` | ✅ | `true` | Set manually |
| `EMAIL_HOST` | ✅ | `smtp.gmail.com` | Gmail SMTP |
| `EMAIL_PORT` | ✅ | `587` | Gmail SMTP |
| `EMAIL_USER` | ✅ | `your@gmail.com` | Your Gmail |
| `EMAIL_PASS` | ✅ | `app-password` | Gmail App Password |
| `CLOUDINARY_CLOUD_NAME` | ✅ | `dxxxxxxx` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | ✅ | `123456789` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | `secret` | Cloudinary Dashboard |
| `CORS_ORIGIN` | ⚠️ | `https://app.com` | Your frontend URL |
| `SESSION_SECRET` | ⚠️ | `random-string` | Generate yourself |

✅ = Required | ⚠️ = Recommended

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Step 1: Install Vercel CLI** (Optional)
```bash
npm install -g vercel
```

**Step 2: Deploy via Dashboard**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

**Step 3: Environment Variables**
Add this single variable:
```
VITE_API_URL=https://pastport-backend.onrender.com
```

**Step 4: Deploy**
1. Click "Deploy"
2. Get your URL: `https://your-app.vercel.app`
3. Go back to Render backend and update `FRONTEND_URL`

---

### Option 2: Render (Frontend)

**Step 1: Create Static Site**
1. In Render, click "New +" → "Static Site"
2. Connect repository
3. Configure:
```
Name: pastport-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

**Step 2: Environment Variables**
```
VITE_API_URL=https://pastport-backend.onrender.com
```

---

## Post-Deployment Steps

### 1. Update Frontend URL in Backend
1. Go to Render backend service
2. Environment Variables
3. Update `FRONTEND_URL` to your actual frontend URL
4. Save (will trigger redeploy)

### 2. Update CORS Settings
If using custom CORS:
```
CORS_ORIGIN=https://your-actual-frontend.vercel.app
```

### 3. Test Email Service
Send a test email from backend:
```bash
curl -X POST https://pastport-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"your@email.com","password":"Test123!"}'
```

Check your inbox for welcome email!

### 4. Enable Auto-Deploy
In Render:
1. Settings → "Auto-Deploy"
2. Enable "Auto-Deploy" for main branch
3. Now pushes to GitHub auto-deploy

---

## Testing Your Deployment

### Backend Health Check
```bash
curl https://pastport-backend.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### Database Connection
Check Render logs:
```
✅ MongoDB Connected
📅 Scheduler started
```

### Email Service
Check logs for:
```
Email service is ready to send messages
```

### Complete Test Checklist
- [ ] Backend is live and responding
- [ ] Frontend loads correctly
- [ ] Can register new user
- [ ] Welcome email arrives
- [ ] Can login successfully
- [ ] Can create time capsule
- [ ] Can upload media
- [ ] Can write journal entry
- [ ] Notifications appear
- [ ] 3D constellation loads

---

## Troubleshooting

### Issue: MongoDB Connection Failed
**Solution**:
1. Check IP whitelist (should be `0.0.0.0/0`)
2. Verify username/password in URI
3. Check database user permissions
4. Ensure URI includes database name: `/pastport`

### Issue: Email Not Sending
**Solution**:
1. Verify Gmail app password (no spaces)
2. Check 2FA is enabled
3. Set `EMAIL_ENABLED=true`
4. Check Render logs for email errors

### Issue: CORS Errors
**Solution**:
1. Update `FRONTEND_URL` in backend
2. Add `CORS_ORIGIN` if needed
3. Ensure URLs don't have trailing slashes
4. Redeploy backend after changing

### Issue: Images Not Uploading
**Solution**:
1. Verify Cloudinary credentials
2. Check API key has spaces removed
3. Test Cloudinary connection in logs
4. Ensure cloud name is correct

### Issue: Build Fails
**Solution**:
1. Check `package.json` has correct scripts
2. Verify Node version compatibility
3. Check build command in Render settings
4. Review build logs for specific errors

---

## Render Dashboard Quick Reference

### Viewing Logs
1. Go to your service
2. Click "Logs" tab
3. Filter by error level
4. Search for specific terms

### Redeploying
1. Manual Deploy: Click "Manual Deploy" → "Deploy latest commit"
2. Auto Deploy: Push to GitHub main branch

### Monitoring
1. Go to service → "Metrics"
2. View:
   - Response times
   - Memory usage
   - Request volume
   - Error rates

---

## Cost Optimization

### Free Tier Limits (Render)
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ Automatic sleep after 15 min inactivity
- ✅ First request after sleep takes ~30 seconds
- ⚠️ Services spin down if no traffic

### Keep Service Awake
Use a free monitoring service:
- **UptimeRobot**: https://uptimerobot.com (50 monitors free)
- **Cron-Job**: https://cron-job.org (unlimited free)

Setup: Ping your backend every 10 minutes:
```
https://pastport-backend.onrender.com/health
```

---

## Security Best Practices

### ✅ Do's
- Use strong JWT secrets (32+ characters)
- Enable HTTPS only (Render does this automatically)
- Set proper CORS origins
- Use environment variables for secrets
- Enable rate limiting
- Whitelist only necessary IPs

### ❌ Don'ts
- Never commit `.env` files
- Don't share API keys publicly
- Don't use weak passwords
- Don't disable CORS entirely
- Don't expose MongoDB directly

---

## Support Resources

### Documentation
- **Render**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Cloudinary**: https://cloudinary.com/documentation
- **Vercel**: https://vercel.com/docs

### Community
- Render Community: https://community.render.com
- MongoDB Forums: https://www.mongodb.com/community/forums

---

## Quick Deploy Checklist

### Before Deploying:
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account set up
- [ ] Gmail app password generated
- [ ] All API keys collected

### Backend Deployment:
- [ ] Web service created on Render
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Health check endpoint working
- [ ] Logs show no errors

### Frontend Deployment:
- [ ] Deployed to Vercel/Render
- [ ] `VITE_API_URL` set correctly
- [ ] Site loads successfully
- [ ] Can make API requests

### Final Steps:
- [ ] Updated `FRONTEND_URL` in backend
- [ ] Tested user registration
- [ ] Welcome email received
- [ ] Can login and use all features
- [ ] Set up monitoring/uptime checks

---

## 🎉 Congratulations!

Your PastPort application is now live and ready for users!

**Next Steps:**
1. Share your app with friends and family
2. Set up monitoring and alerts
3. Configure a custom domain (optional)
4. Add analytics (Google Analytics, etc.)
5. Set up backups for MongoDB

**Your URLs:**
- Backend: `https://pastport-backend.onrender.com`
- Frontend: `https://your-app.vercel.app`

**Happy Deploying! 🚀✨**

