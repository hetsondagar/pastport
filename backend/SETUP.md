# PastPort Backend Setup Guide

This guide will help you set up the PastPort backend API for development and production.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for media uploads)
- Email service (Gmail, SendGrid, etc.)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

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

# Cloudinary Configuration (for media uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (for notifications)
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

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# macOS with Homebrew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

#### Option B: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Whitelist your IP address
6. Get the connection string and add it to `.env`

### 4. Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. Go to Dashboard and copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add these to your `.env` file

### 5. Email Setup (Optional)

For email notifications, you can use:

#### Gmail
1. Enable 2-factor authentication
2. Generate an App Password
3. Use your Gmail address and app password in `.env`

#### SendGrid
1. Create a SendGrid account
2. Get API key
3. Update email configuration in `.env`

### 6. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- PastPort API on port 5000
- MongoDB on port 27017
- MongoDB Express (admin UI) on port 8081

## Frontend Integration

Update your frontend to connect to the backend:

### 1. API Base URL
```javascript
// In your frontend config
const API_BASE_URL = 'http://localhost:5000/api';
```

### 2. Authentication
```javascript
// Store JWT token after login
localStorage.setItem('token', response.data.token);

// Include token in API requests
const token = localStorage.getItem('token');
fetch(`${API_BASE_URL}/capsules`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Example API Calls

#### Create a Capsule
```javascript
const createCapsule = async (capsuleData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/capsules`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(capsuleData)
  });
  return response.json();
};
```

#### Get User's Capsules
```javascript
const getCapsules = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/capsules?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pastport
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deployment Platforms

#### Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

#### Railway
1. Connect your GitHub repository
2. Add MongoDB service
3. Set environment variables
4. Deploy

#### Heroku
1. Create Heroku app
2. Add MongoDB Atlas addon
3. Set environment variables
4. Deploy

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running locally or check your Atlas connection string.

#### 2. JWT Secret Error
```
Error: secretOrPrivateKey must have a value
```
**Solution**: Make sure `JWT_SECRET` is set in your `.env` file.

#### 3. Cloudinary Upload Error
```
Error: Must supply api_key
```
**Solution**: Check your Cloudinary credentials in `.env`.

#### 4. CORS Error
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: Make sure `FRONTEND_URL` is set correctly in your `.env` file.

### Logs and Debugging

#### Development Logs
```bash
# View detailed logs
npm run dev

# Check specific logs
tail -f logs/app.log
```

#### Production Logs
```bash
# If using PM2
pm2 logs pastport-api

# If using Docker
docker-compose logs -f pastport-api
```

## Security Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Validate all input data
- [ ] Use MongoDB Atlas with proper security
- [ ] Set up proper file upload restrictions
- [ ] Enable email verification (optional)
- [ ] Set up monitoring and logging

## Performance Optimization

- [ ] Use MongoDB indexes
- [ ] Implement caching (Redis)
- [ ] Optimize database queries
- [ ] Use CDN for static assets
- [ ] Enable compression
- [ ] Set up load balancing (if needed)

## Monitoring

### Health Checks
- API health: `GET /health`
- Database connection
- External service status

### Metrics to Monitor
- Response times
- Error rates
- Database performance
- Memory usage
- CPU usage

## Support

If you encounter any issues:

1. Check the logs for error messages
2. Verify all environment variables are set
3. Test database connectivity
4. Check external service credentials
5. Review the API documentation

For additional help, please refer to the main README.md or create an issue in the repository.
