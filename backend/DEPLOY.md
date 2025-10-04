# PastPort Backend Deployment Guide

This guide covers deploying the PastPort backend API to various platforms.

## Prerequisites

- Node.js 18+ installed locally
- MongoDB database (local or cloud)
- Git repository with your code
- Environment variables configured

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/pastport
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pastport

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email Configuration (optional)
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or start your local MongoDB service
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## Deployment Options

### Option 1: Render (Recommended for Free Tier)

1. **Connect your GitHub repository to Render**

2. **Create a new Web Service:**
   - Choose your repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

3. **Configure environment variables in Render dashboard:**
   - `NODE_ENV=production`
   - `MONGODB_URI=your-mongodb-connection-string`
   - `JWT_SECRET=your-secret-key`
   - `FRONTEND_URL=your-frontend-url`

4. **Deploy!** Render will automatically build and deploy your app.

### Option 2: Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI=your-mongodb-uri
   railway variables set JWT_SECRET=your-secret
   ```

### Option 3: Heroku

1. **Install Heroku CLI**

2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Add MongoDB addon:**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set FRONTEND_URL=your-frontend-url
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 4: Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t pastport-backend .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Or run standalone:**
   ```bash
   docker run -d \
     -p 5000:5000 \
     -e MONGODB_URI=mongodb://host.docker.internal:27017/pastport \
     -e JWT_SECRET=your-secret \
     pastport-backend
   ```

## Database Setup

### MongoDB Atlas (Cloud)

1. **Create a MongoDB Atlas account**
2. **Create a new cluster**
3. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/pastport
   ```
4. **Add your IP to whitelist**
5. **Use the connection string in your environment variables**

### Local MongoDB

1. **Install MongoDB locally**
2. **Start MongoDB service**
3. **Use connection string:**
   ```
   mongodb://localhost:27017/pastport
   ```

## Security Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates

## Monitoring and Logs

### Health Check Endpoint
- `GET /health` - Returns server status

### API Documentation
- `GET /api-docs` - Swagger documentation

### Logs
- Application logs are written to `logs/` directory in production
- Use `winston` for structured logging

## Troubleshooting

### Common Issues

1. **Database Connection Failed:**
   - Check MongoDB URI format
   - Verify network connectivity
   - Check firewall settings

2. **JWT Token Issues:**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper token format

3. **CORS Errors:**
   - Update FRONTEND_URL environment variable
   - Check CORS configuration in server.js

4. **Rate Limiting:**
   - Adjust RATE_LIMIT_MAX_REQUESTS if needed
   - Check rate limit window settings

### Debug Mode

Set `NODE_ENV=development` to enable:
- Detailed error messages
- Request logging
- Debug information

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and accessible
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Health checks working
- [ ] API documentation accessible
- [ ] Tests passing
- [ ] Security headers enabled

## Scaling Considerations

- Use MongoDB Atlas for database scaling
- Consider Redis for session storage
- Implement horizontal scaling with load balancers
- Use CDN for static assets
- Monitor performance and set up alerts

## Support

For issues and questions:
- Check the logs in your deployment platform
- Review the API documentation at `/api-docs`
- Test endpoints using the health check
- Verify environment variables are set correctly
