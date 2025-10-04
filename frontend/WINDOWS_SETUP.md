# PastPort Windows Setup Guide

This guide will help you set up PastPort on Windows with both frontend and backend properly connected.

## Prerequisites

### 1. Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version for Windows
3. Run the installer and follow the setup wizard
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### 2. Install MongoDB (Optional - for local development)
**Option A: MongoDB Community Server**
1. Go to [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for Windows
3. Install with default settings
4. Start MongoDB service

**Option B: MongoDB Atlas (Recommended)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string

## Quick Start (Automated)

### 1. Run the Setup Script
```cmd
# Double-click start-dev.bat or run in Command Prompt
start-dev.bat
```

This script will:
- Check prerequisites
- Install dependencies
- Create environment files
- Start both servers

### 2. Manual Setup (If script fails)

#### Step 1: Clone/Download the Project
```cmd
# If using git
git clone <repository-url>
cd pastport

# Or extract the ZIP file to a folder
```

#### Step 2: Set Up Backend
```cmd
cd backend
npm install
```

#### Step 3: Configure Backend Environment
1. Copy `backend/env.example` to `backend/.env`
2. Edit `backend/.env` with your settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - Choose one
MONGODB_URI=mongodb://localhost:27017/pastport
# OR for MongoDB Atlas
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pastport

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# Cloudinary Configuration (optional for now)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 4: Set Up Frontend
```cmd
cd ..
npm install
```

#### Step 5: Configure Frontend Environment
1. Copy `env.example` to `.env`
2. Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Step 6: Start Both Servers

**Terminal 1 - Backend:**
```cmd
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```cmd
npm run dev
```

## Testing the Connection

### 1. Check Backend Health
Open browser and go to: `http://localhost:5000/health`

Expected response:
```json
{
  "success": true,
  "message": "PastPort API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### 2. Check Frontend
Open browser and go to: `http://localhost:5173`

You should see the PastPort landing page with login/register forms.

### 3. Test Registration
1. Click "Register" tab
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"

### 4. Test Login
1. Click "Login" tab
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"

### 5. Test Dashboard
After successful login, you should be redirected to the dashboard showing:
- User stats (0 capsules initially)
- Empty capsule list
- Navigation with user menu

### 6. Test Capsule Creation
1. Click "New Capsule" or "Create"
2. Fill out the form:
   - Title: My First Capsule
   - Message: Hello future me!
   - Unlock Date: Set a future date
   - Choose an emoji
3. Click "Create Capsule"

## Troubleshooting

### Common Windows Issues

#### 1. Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### 2. PowerShell Execution Policy
**Error:** `cannot be loaded because running scripts is disabled on this system`

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. Node Modules Issues
**Error:** `npm ERR!` or missing modules

**Solution:**
```cmd
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
rmdir /s backend\node_modules
npm install
cd backend && npm install
```

#### 4. MongoDB Connection Issues
**Error:** `MongoDB connection error`

**Solution:**
- **Local MongoDB:** Make sure MongoDB service is running
  ```cmd
  # Check if MongoDB service is running
  sc query MongoDB
  
  # Start MongoDB service
  net start MongoDB
  ```

- **MongoDB Atlas:** Check connection string and network access

#### 5. CORS Issues
**Error:** `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:**
- Check that `FRONTEND_URL=http://localhost:5173` is set in `backend/.env`
- Restart the backend server

#### 6. Environment Variables Not Loading
**Error:** Variables not found

**Solution:**
- Make sure `.env` files are in the correct locations
- Restart both servers after changing environment variables
- Check for typos in variable names

### Windows-Specific Commands

#### Check if Ports are in Use
```cmd
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

#### Kill Processes by Port
```cmd
# Find PID first, then kill
taskkill /PID <PID> /F
```

#### Check Node.js Version
```cmd
node --version
npm --version
```

#### Clear npm Cache
```cmd
npm cache clean --force
```

## Development Workflow

### Daily Development
1. **Start servers:**
   ```cmd
   # Option 1: Use the batch file
   start-dev.bat
   
   # Option 2: Manual start
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   npm run dev
   ```

2. **Make changes** to your code
3. **Test in browser** at `http://localhost:5173`
4. **Check console** for any errors

### Stopping Servers
- Press `Ctrl+C` in each terminal
- Or close the terminal windows
- Or use Task Manager to end Node.js processes

## Production Deployment

### For Windows Server
1. **Install PM2** for process management:
   ```cmd
   npm install -g pm2
   ```

2. **Build frontend:**
   ```cmd
   npm run build
   ```

3. **Start backend with PM2:**
   ```cmd
   cd backend
   pm2 start server.js --name pastport-backend
   ```

4. **Serve frontend** with a web server like IIS or Nginx

## Support

If you encounter issues:

1. **Check the logs** in both terminal windows
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly with curl or Postman
4. **Check Windows Firewall** settings
5. **Review the connection test guide** in `CONNECTION_TEST.md`

## Next Steps

Once everything is working:

1. **Explore the features** - create capsules, test riddles
2. **Customize the UI** - modify components and styles
3. **Add new features** - extend the API and frontend
4. **Deploy to production** - use the deployment guides

The PastPort app should now be fully functional on Windows! 🎉
