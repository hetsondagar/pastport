# PastPort - Time Capsule Web Application

A full-stack time capsule and memory keeper web application built with React and Node.js.

## Project Structure

```
pastport/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Node.js backend API
│   ├── controllers/  # Route controllers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── package.json  # Backend dependencies
└── README.md         # This file
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features

- 🔐 **Secure Authentication** - JWT tokens with refresh token support
- 📦 **Time Capsules** - Create and manage time capsules
- 🔒 **Riddle Protection** - Secure capsules with custom riddles
- 👥 **Social Features** - Friends, notifications, and sharing
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Production Ready** - Docker, testing, and deployment configs

## Documentation

- **Backend API**: `/api-docs` (Swagger documentation)
- **Deployment**: See `backend/DEPLOY.md`
- **Frontend**: See `frontend/README.md`

## Tech Stack

**Frontend**: React, TypeScript, Tailwind CSS, Vite
**Backend**: Node.js, Express, MongoDB, JWT, Joi validation
**Deployment**: Docker, Render, Railway support
