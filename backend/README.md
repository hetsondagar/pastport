# PastPort Backend API

A comprehensive Node.js backend for the PastPort time capsule web application, built with Express.js and MongoDB.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with user registration/login
- 📦 **Time Capsules**: Create, manage, and unlock time capsules with optional riddles
- 👥 **Social Features**: Friend system, shared capsules, reactions, and comments
- 🏆 **Gamification**: Badge system with achievements and milestones
- 📧 **Notifications**: In-app and email notifications with scheduling
- 📁 **Media Upload**: Cloudinary integration for images, videos, and documents
- 🔍 **Search & Filter**: Advanced search and filtering capabilities
- 📊 **Analytics**: User statistics and capsule analytics
- 🛡️ **Security**: Rate limiting, input validation, and security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **Scheduling**: Cron jobs
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── cloudinary.js        # Cloudinary configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── capsuleController.js # Capsule CRUD operations
│   ├── userController.js    # User profile & friends
│   └── notificationController.js # Notifications
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Global error handling
│   ├── validation.js       # Input validation
│   └── upload.js           # File upload handling
├── models/
│   ├── User.js             # User schema
│   ├── Capsule.js          # Capsule schema
│   └── Notification.js     # Notification schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── capsules.js         # Capsule routes
│   ├── users.js            # User routes
│   └── notifications.js    # Notification routes
├── utils/
│   ├── generateToken.js    # JWT token generation
│   ├── emailService.js     # Email templates & sending
│   └── scheduler.js        # Cron job scheduling
├── server.js               # Main server file
├── package.json            # Dependencies
└── env.example             # Environment variables template
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/pastport
   MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pastport
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/preferences` - Update user preferences
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/search` - Search users

### Capsules
- `GET /api/capsules` - Get user's capsules (with filters)
- `GET /api/capsules/stats` - Get capsule statistics
- `GET /api/capsules/:id` - Get single capsule
- `POST /api/capsules` - Create new capsule
- `PUT /api/capsules/:id` - Update capsule
- `DELETE /api/capsules/:id` - Delete capsule
- `POST /api/capsules/:id/unlock` - Unlock capsule
- `POST /api/capsules/:id/reactions` - Add reaction
- `POST /api/capsules/:id/comments` - Add comment

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/friends` - Get user's friends
- `GET /api/users/:id/badges` - Get user's badges
- `GET /api/users/:id/capsules` - Get user's public capsules
- `POST /api/users/:id/friend-request` - Send friend request
- `PUT /api/users/friend-requests/:id` - Respond to friend request
- `DELETE /api/users/:id/friends` - Remove friend

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Database Models

### User Model
- Personal information (name, email, avatar, bio)
- Friends system with friend requests
- Badges and achievements
- User preferences and settings
- Statistics (capsules created, unlocked, etc.)

### Capsule Model
- Basic info (title, message, emoji, unlock date)
- Creator and shared users
- Riddle system with hints and attempts
- Media attachments (images, videos, documents)
- Tags and categories
- Reactions and comments
- Unlock status and metadata

### Notification Model
- User notifications with different types
- Read/unread status
- Expiration dates
- Associated data (capsule, user, etc.)

## Features

### Time Capsules
- Create capsules with future unlock dates
- Optional riddle challenges for unlocking
- Media attachments via Cloudinary
- Tags and categories for organization
- Share with friends or keep private

### Social Features
- Friend system with requests and management
- Shared capsules between friends
- Reactions and comments on unlocked capsules
- User profiles with privacy settings

### Gamification
- Badge system with different categories
- Achievement tracking
- User statistics and milestones
- Progress indicators

### Notifications
- In-app notifications
- Email reminders for unlock dates
- Friend request notifications
- Automated scheduling with cron jobs

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- File upload restrictions

## Deployment

### Environment Variables
Make sure to set all required environment variables in your production environment:

```env
NODE_ENV=production
PORT=5000
MONGODB_ATLAS_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
EMAIL_HOST=your-smtp-host
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Platforms
- **Render**: Easy deployment with automatic builds
- **Railway**: Simple deployment with database integration
- **Heroku**: Traditional platform with add-ons
- **DigitalOcean**: VPS deployment with full control

### Database Setup
1. Create a MongoDB Atlas cluster
2. Set up database user with read/write permissions
3. Configure network access (IP whitelist)
4. Get connection string and add to environment variables

### Cloudinary Setup
1. Create Cloudinary account
2. Get cloud name, API key, and API secret
3. Configure upload presets for different file types
4. Set up transformation rules for image optimization

## Development

### Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (when implemented)
```

### Code Style
- Use ES6+ features
- Follow RESTful API conventions
- Implement proper error handling
- Use async/await for database operations
- Add input validation for all endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
