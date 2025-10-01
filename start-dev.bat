@echo off
echo 🚀 Starting PastPort Development Environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Backend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found. Creating from example...
    if exist "backend\env.example" (
        copy "backend\env.example" "backend\.env" >nul
        echo 📝 Please edit backend\.env with your configuration
    ) else (
        echo ❌ backend\env.example not found. Please create backend\.env manually.
        pause
        exit /b 1
    )
)

REM Check if frontend .env exists
if not exist ".env" (
    echo ⚠️  Frontend .env file not found. Creating from example...
    if exist "env.example" (
        copy "env.example" ".env" >nul
        echo ✅ Frontend .env created
    ) else (
        echo ❌ env.example not found. Please create .env manually.
        pause
        exit /b 1
    )
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
if not exist "node_modules" (
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend dependencies already installed
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..
if not exist "node_modules" (
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies already installed
)

echo.
echo 🎉 Setup complete! Starting servers...
echo.
echo 📋 Next steps:
echo 1. Backend will start on http://localhost:5000
echo 2. Frontend will start on http://localhost:5173
echo 3. Open http://localhost:5173 in your browser
echo 4. Register a new account to get started
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend
echo 🔧 Starting backend server...
start "PastPort Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
start "PastPort Frontend" cmd /k "npm run dev"

echo ✅ Both servers are starting...
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:5000
echo.
echo Press any key to exit this window (servers will continue running)
pause >nul
