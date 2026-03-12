import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cek_lulus";

if (!MONGODB_URI) {
  throw new Error("Tolong definisikan MONGODB_URI di file .env.local");
}

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Terhubung ke MongoDB");
  } catch (error) {
    console.error("❌ Gagal koneksi MongoDB:", error);
  }
};