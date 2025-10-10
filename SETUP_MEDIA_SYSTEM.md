# 🚀 Media System Quick Setup Guide

## Prerequisites

- ✅ Backend already running
- ✅ Frontend already running
- ✅ MongoDB connected
- ⚠️ **Need:** Cloudinary account (free tier)

---

## Step 1: Get Cloudinary Credentials (5 minutes)

### Option A: Create New Account
1. Go to https://cloudinary.com
2. Click "Sign Up" (free tier)
3. Verify email
4. Go to Dashboard
5. Copy these 3 values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Option B: Use Existing Account
1. Login to Cloudinary
2. Go to Dashboard
3. Copy the 3 credentials

---

## Step 2: Add to Backend .env File

```bash
# Open backend/.env and add:
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Example:**
```bash
CLOUDINARY_CLOUD_NAME=pastport-cloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

---

## Step 3: Install Required npm Package

```bash
# Go to backend folder
cd backend

# Install multer (if not already installed)
npm install multer

# Install cloudinary SDK (if not already installed)  
npm install cloudinary

# Restart backend server
npm run dev
```

---

## Step 4: Verify Installation

### Check Server Logs
You should see:
```
🚀 PastPort API Server running on port 5000
MongoDB Connected: 127.0.0.1
```

### Test Health Endpoint
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "PastPort API is running"
}
```

---

## Step 5: Test Media Upload

### Using the Frontend

1. **Navigate to Create Capsule:**
   ```
   http://localhost:8081/create
   ```

2. **Fill Capsule Form:**
   - Title: "Test Media Capsule"
   - Message: "Testing media uploads"
   - Unlock Date: Tomorrow

3. **Upload Media:**
   - Scroll to "Media Attachments" section
   - Click "Select Files"
   - Choose an image file
   - Add caption (optional)
   - Click "Upload"
   - Wait for green "Uploaded" badge

4. **Submit Capsule:**
   - Click "Create Capsule"
   - Should see success message

5. **View Capsule:**
   - Go to Dashboard
   - Click on the capsule
   - Verify media displays correctly

---

## Step 6: Verify Cloudinary Upload

1. Login to Cloudinary Dashboard
2. Go to "Media Library"
3. You should see:
   - Folder: `pastport/capsule/`
   - Your uploaded image
   - Metadata visible

---

## 🐛 Troubleshooting

### Error: "No file uploaded"
**Solution:** Make sure you're selecting a file before clicking upload

### Error: "Invalid file type"
**Solution:** Only use: JPG, PNG, GIF, WebP, MP4, WebM, MP3, WAV

### Error: "File size exceeds 20MB"
**Solution:** Compress your file or choose a smaller one

### Error: "Cloudinary config error"
**Solution:** 
- Check .env file has all 3 Cloudinary variables
- Restart backend server
- Verify credentials are correct

### Error: "CORS blocked"
**Solution:** 
- Backend already has PATCH in CORS methods
- Restart backend if you just added it

---

## 📁 Package Dependencies

### Backend (package.json)
```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0",
    "express": "^4.18.2",
    "mongoose": "^7.6.3"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.294.0"
  }
}
```

---

## ✅ System Status

After following these steps:

### Backend
- ✅ `/api/media/upload` endpoint active
- ✅ `/api/media/:type/:id` endpoint active
- ✅ Cloudinary integration working
- ✅ MongoDB storing media references
- ✅ File validation active

### Frontend
- ✅ MediaUploader component ready
- ✅ MediaDisplay component ready
- ✅ Integrated in Create Capsule
- ✅ Integrated in modals
- ✅ Thumbnails on cards

### Database
- ✅ Media collection created
- ✅ Capsule.media array updated
- ✅ JournalEntry.media array updated
- ✅ Indexes created

---

## 🎉 You're Ready!

The complete media attachment system is now operational. Users can:

- 📸 Upload photos to capsules
- 🎥 Attach videos to journal entries
- 🎵 Add audio recordings
- 👀 Preview before upload
- 💾 Everything saved to Cloudinary
- 🌍 Deployable to Render immediately

**Start the servers and test it out!** 🚀

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Then visit: `http://localhost:8081/create`

Happy uploading! 📸🎥🎵✨

