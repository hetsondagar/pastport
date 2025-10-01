#!/bin/bash

# PastPort Development Startup Script
echo "🚀 Starting PastPort Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check if ports are available
echo "🔍 Checking if ports are available..."
if ! check_port 5000; then
    echo "❌ Port 5000 (backend) is already in use. Please stop the process using this port."
    exit 1
fi

if ! check_port 5173; then
    echo "❌ Port 5173 (frontend) is already in use. Please stop the process using this port."
    exit 1
fi

echo "✅ Ports 5000 and 5173 are available"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from example..."
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo "📝 Please edit backend/.env with your configuration"
    else
        echo "❌ backend/env.example not found. Please create backend/.env manually."
        exit 1
    fi
fi

# Check if frontend .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env file not found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Frontend .env created"
    else
        echo "❌ env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
else
    echo "✅ Backend dependencies already installed"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ..
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "🎉 Setup complete! Starting servers..."
echo ""
echo "📋 Next steps:"
echo "1. Backend will start on http://localhost:5000"
echo "2. Frontend will start on http://localhost:5173"
echo "3. Open http://localhost:5173 in your browser"
echo "4. Register a new account to get started"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd ..
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
