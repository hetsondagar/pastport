# ⚡ Quick Deploy Guide - 30 Minutes to Live!

This is the FASTEST way to get PastPort deployed. Follow in order.

---

## 🎯 Quick Deploy Steps

### Step 1: MongoDB Atlas (5 min)
```
1. https://cloud.mongodb.com → Sign up
2. Create project "PastPort"
3. Create FREE cluster
4. Create user: pastport-admin / [strong password]
5. Network Access → Add 0.0.0.0/0
6. Connect → Copy connection string
7. Replace <password> and add /pastport before ?
```

**Get:** `mongodb+srv://pastport-admin:PASSWORD@cluster.mongodb.net/pastport...`

---

### Step 2: Cloudinary (5 min)
```
1. https://cloudinary.com → Sign up
2. Dashboard → Copy 3 values:
   - Cloud Name
   - API Key
   - API Secret
```

**Get:** 3 Cloudinary credentials

---

### Step 3: Push to GitHub (2 min)
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### Step 4: Deploy Backend on Render (10 min)
```
1. https://render.com → Login with GitHub
2. New + → Web Service
3. Connect your repo
4. Configure:
   - Name: pastport-backend
   - Root: backend
   - Build: npm install
   - Start: npm start
   
5. Add Environment Variables (copy from ENVIRONMENT_VARIABLES.md):
   - NODE_ENV=production
   - MONGODB_URI=[from Step 1]
   - JWT_SECRET=[generate random 32+ chars]
   - CLOUDINARY_CLOUD_NAME=[from Step 2]
   - CLOUDINARY_API_KEY=[from Step 2]
   - CLOUDINARY_API_SECRET=[from Step 2]
   - FRONTEND_URL=https://pastport.vercel.app
   - (see ENVIRONMENT_VARIABLES.md for all)
   
6. Create Web Service
7. Wait 5-10 min
8. Copy backend URL: https://pastport-backend-XXXX.onrender.com
```

**Test:** Visit `https://pastport-backend-XXXX.onrender.com/health`

---

### Step 5: Deploy Frontend on Vercel (5 min)
```
1. https://vercel.com → Login with GitHub
2. Add New → Project
3. Import your repo
4. Configure:
   - Framework: Vite
   - Root: frontend
   - Build: npm run build
   - Output: dist
   
5. Environment Variables:
   - VITE_API_URL=https://pastport-backend-XXXX.onrender.com/api
   
6. Deploy
7. Wait 2-3 min
8. Copy frontend URL: https://pastport-XXXX.vercel.app
```

**Test:** Visit `https://pastport-XXXX.vercel.app`

---

### Step 6: Update CORS (3 min)
```
1. Go back to Render
2. Environment → Edit FRONTEND_URL
3. Change to: https://pastport-XXXX.vercel.app
4. Save (auto-redeploys)
5. Wait 2 min
```

---

### Step 7: Test Everything! (5 min)
```
1. Open: https://pastport-XXXX.vercel.app
2. Register account
3. Login
4. Create capsule
5. Upload image
6. View on dashboard
7. ✅ DONE!
```

---

## ✅ Success Checklist

After completing all steps:

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] MongoDB connected
- [ ] Cloudinary configured
- [ ] Can register users
- [ ] Can create capsules
- [ ] Can upload media
- [ ] No errors in console

---

## 🎁 Your Live App URLs

```
Frontend (Share this!):
https://pastport-XXXX.vercel.app

Backend API:
https://pastport-backend-XXXX.onrender.com

Health Check:
https://pastport-backend-XXXX.onrender.com/health

API Docs:
https://pastport-backend-XXXX.onrender.com/api-docs
```

---

## 🔧 If Something Goes Wrong

**Backend won't start:**
- Check MongoDB URI is correct
- Verify all env vars are set
- Check Render logs for errors

**Frontend shows errors:**
- Verify VITE_API_URL points to Render
- Check backend is running
- Clear browser cache

**Upload fails:**
- Check Cloudinary credentials
- Verify all 3 env vars are correct
- Test Cloudinary dashboard access

**CORS errors:**
- Ensure FRONTEND_URL matches Vercel URL exactly
- Include protocol (https://)
- Redeploy backend after changing

---

## 📊 Deployment Time Breakdown

| Step | Time | Task |
|------|------|------|
| 1 | 5 min | MongoDB Atlas setup |
| 2 | 5 min | Cloudinary setup |
| 3 | 2 min | Git push |
| 4 | 10 min | Render deployment |
| 5 | 5 min | Vercel deployment |
| 6 | 3 min | Update CORS |
| 7 | 5 min | Testing |
| **Total** | **35 min** | **Complete deployment** |

---

## 💡 Pro Tips

1. **Save All URLs:**
   - Keep a note of backend URL
   - Keep a note of frontend URL
   - Save MongoDB URI securely
   - Save Cloudinary credentials

2. **Environment Variables:**
   - Use a password manager
   - Never commit .env to git
   - Use strong JWT secret
   - Rotate secrets periodically

3. **Testing:**
   - Test backend health first
   - Then test frontend
   - Then test integration
   - Check browser console for errors

4. **Monitoring:**
   - Check Render logs regularly
   - Monitor Vercel analytics
   - Watch MongoDB Atlas metrics
   - Track Cloudinary usage

---

## 🎉 That's It!

**In 30-35 minutes, you have:**
- ✅ Professional web app deployed
- ✅ Global accessibility
- ✅ HTTPS security
- ✅ Cloud database
- ✅ Media storage
- ✅ $0/month cost
- ✅ Auto-deployment on git push
- ✅ Portfolio-ready project!

**Share your app with the world!** 🌍✨

---

## 📚 Detailed Guides

For step-by-step instructions, see:
- `DEPLOYMENT_GUIDE.md` - Complete detailed guide
- `DEPLOYMENT_CHECKLIST.md` - Checkbox checklist
- `ENVIRONMENT_VARIABLES.md` - This file
- `SETUP_MEDIA_SYSTEM.md` - Media system setup

---

**Ready? Let's deploy!** 🚀

