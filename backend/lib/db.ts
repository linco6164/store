import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in the environment variables');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    mongoose.set("debug", true);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

