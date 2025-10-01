# PastPort Frontend-Backend Integration Guide

This guide will help you connect your React frontend with the Node.js backend API.

## Quick Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

The frontend already includes the API client and authentication context. You just need to:

1. **Set the API URL** (optional, defaults to localhost:5000):
   ```bash
   # Create .env file in frontend root
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## API Integration

### Authentication Flow

The frontend uses the `AuthContext` to manage authentication state:

```jsx
import { useAuth } from './contexts/AuthContext';

function LoginForm() {
  const { login, user, loading, error } = useAuth();

  const handleSubmit = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // User logged in successfully
      console.log('User:', result.data.user);
    } else {
      // Handle error
      console.error('Login failed:', result.message);
    }
  };

  return (
    // Your login form JSX
  );
}
```

### API Client Usage

The `apiClient` provides methods for all backend endpoints:

```jsx
import apiClient from './lib/api';

// Get user's capsules
const capsules = await apiClient.getCapsules({
  status: 'locked',
  category: 'personal',
  page: 1,
  limit: 10
});

// Create a new capsule
const newCapsule = await apiClient.createCapsule({
  title: 'My First Capsule',
  message: 'Hello future me!',
  unlockDate: '2024-12-25',
  emoji: '🎄',
  tags: ['personal', 'holiday']
});

// Unlock a capsule
const result = await apiClient.unlockCapsule('capsule-id', 'riddle-answer');
```

## Component Integration Examples

### 1. Update Dashboard Component

Replace the sample data in `Dashboard.tsx` with real API calls:

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadCapsules();
    loadStats();
  }, []);

  const loadCapsules = async () => {
    try {
      const response = await apiClient.getCapsules({
        status: 'all',
        page: 1,
        limit: 20
      });
      setCapsules(response.data.capsules);
    } catch (error) {
      console.error('Failed to load capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.getCapsuleStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Rest of your component...
};
```

### 2. Update CreateCapsule Component

```jsx
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/api';

const CreateCapsule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await apiClient.createCapsule({
        title: formData.title,
        message: formData.message,
        emoji: formData.emoji,
        unlockDate: formData.unlockDate,
        hasRiddle: formData.hasRiddle,
        riddle: formData.riddle,
        riddleAnswer: formData.riddleAnswer,
        tags: formData.tags,
        category: 'personal',
        isPublic: formData.isShared
      });

      if (response.success) {
        toast({
          title: "Capsule Created! ✨",
          description: "Your time capsule has been safely stored.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create capsule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component...
};
```

### 3. Add Authentication to App

Wrap your app with the AuthProvider:

```jsx
// In App.tsx
import { AuthProvider } from './contexts/AuthContext';

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateCapsule />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);
```

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pastport
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/search` - Search users

### Capsules
- `GET /api/capsules` - Get user's capsules
- `GET /api/capsules/:id` - Get single capsule
- `POST /api/capsules` - Create capsule
- `PUT /api/capsules/:id` - Update capsule
- `DELETE /api/capsules/:id` - Delete capsule
- `POST /api/capsules/:id/unlock` - Unlock capsule
- `POST /api/capsules/:id/reactions` - Add reaction
- `POST /api/capsules/:id/comments` - Add comment

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/friends` - Get user's friends
- `POST /api/users/:id/friend-request` - Send friend request
- `PUT /api/users/friend-requests/:id` - Respond to friend request

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `GET /api/notifications/unread-count` - Get unread count

## Error Handling

The API client automatically handles common errors:

```jsx
try {
  const response = await apiClient.getCapsules();
  // Handle success
} catch (error) {
  // Error is already logged to console
  // Show user-friendly message
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
```

## Loading States

Use the loading states from the auth context:

```jsx
const { loading, user } = useAuth();

if (loading) {
  return <div>Loading...</div>;
}

if (!user) {
  return <LoginForm />;
}

return <Dashboard />;
```

## Real-time Updates

For real-time features, you can implement WebSocket connections or polling:

```jsx
// Poll for new notifications
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const response = await apiClient.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to get unread count:', error);
    }
  }, 30000); // Poll every 30 seconds

  return () => clearInterval(interval);
}, []);
```

## Production Deployment

### Frontend
1. Build the frontend: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Set environment variables in your deployment platform

### Backend
1. Deploy to Render, Railway, or Heroku
2. Set up MongoDB Atlas
3. Configure Cloudinary
4. Set all environment variables

### Environment Variables for Production

**Frontend:**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

**Backend:**
```env
NODE_ENV=production
PORT=5000
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/pastport
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret
EMAIL_HOST=smtp.your-provider.com
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
FRONTEND_URL=https://your-frontend-domain.com
```

## Testing the Integration

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

2. **Test authentication:**
   - Go to `http://localhost:5173`
   - Try registering a new user
   - Try logging in

3. **Test capsule creation:**
   - Create a new capsule
   - Check if it appears in the dashboard

4. **Test API directly:**
   ```bash
   # Health check
   curl http://localhost:5000/health
   
   # Register user
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

## Troubleshooting

### Common Issues

1. **CORS Error:**
   - Make sure `FRONTEND_URL` is set correctly in backend `.env`
   - Check that frontend is running on the correct port

2. **Authentication Issues:**
   - Verify JWT_SECRET is set in backend
   - Check that token is being stored in localStorage

3. **Database Connection:**
   - Ensure MongoDB is running
   - Check connection string in backend `.env`

4. **File Upload Issues:**
   - Verify Cloudinary credentials
   - Check file size limits

### Debug Mode

Enable debug logging in the API client:

```jsx
// In api.js, add console.log for requests
async request(endpoint, options = {}) {
  console.log('API Request:', endpoint, options);
  // ... rest of the method
}
```

## Next Steps

1. **Implement all frontend components** using the API client
2. **Add error boundaries** for better error handling
3. **Implement real-time features** with WebSockets
4. **Add offline support** with service workers
5. **Set up monitoring** and analytics
6. **Add tests** for both frontend and backend

The backend is now fully functional and ready to support your PastPort frontend application!
