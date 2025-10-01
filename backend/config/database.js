import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Prefer local URI in development to avoid SRV DNS issues unless explicitly using Atlas
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
