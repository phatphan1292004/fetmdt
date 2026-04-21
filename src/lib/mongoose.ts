import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function connectDB() {
    return mongoose.connect(MONGODB_URI);
}