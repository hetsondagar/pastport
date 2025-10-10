import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Check if MongoDB URI is configured (prioritize Atlas URI)
    const mongoURI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MongoDB URI not configured!');
      console.error('Please set MONGODB_URI or MONGODB_ATLAS_URI environment variable.');
      console.error('For Render deployment, set MONGODB_URI in the Render dashboard.');
      console.error('Example: mongodb+srv://username:password@cluster.mongodb.net/pastport');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('💡 Make sure your MongoDB URI is correct and accessible.');
    console.error('💡 For MongoDB Atlas, check your IP whitelist and database user permissions.');
    process.exit(1);
  }
};

export default connectDB;
