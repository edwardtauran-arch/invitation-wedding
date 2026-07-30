import mongoose from "mongoose";

// Menggunakan pattern caching global untuk mencegah race condition di Vercel (Serverless)
// di mana banyak request datang bersamaan.
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectToDatabase = async () => {
  if (cached.conn) {
    return true;
  }

  const uri = process.env.MONGODB_URI as string;
  
  if (!uri || uri.includes("#YOUR_DB") || uri.includes("YOUR DB")) {
    console.error("MONGODB_URI is not set correctly!");
    return false;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Beri waktu lebih untuk Vercel Cold Start
      connectTimeoutMS: 10000,
    }).then((mongoose) => {
      console.log("Connected to MongoDB successfully.");
      return mongoose;
    }).catch((error) => {
      console.error("Failed to connect to MongoDB:", error);
      cached.promise = null; // Reset promise on failure
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return true;
  } catch (e) {
    return false;
  }
};

export default connectToDatabase;
