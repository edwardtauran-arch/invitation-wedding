import mongoose from "mongoose";

let isConnecting = false;

const connectToDatabase = async () => {
  // If already connected, do nothing
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  
  if (isConnecting) return false;
  isConnecting = true;

  try {
    const uri = process.env.MONGODB_URI as string;
    if (!uri || uri.includes("#YOUR_DB") || uri.includes("YOUR DB")) {
      throw new Error("MONGODB_URI is not set or contains default placeholder.");
    }
    
    // Set 2 seconds connection timeout so it doesn't hang if offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    console.log("Connected to MongoDB successfully.");
    isConnecting = false;
    return true;
  } catch (error) {
    console.warn("Failed to connect to MongoDB:", (error as Error).message);
    isConnecting = false;
    return false;
  }
};

export default connectToDatabase;
