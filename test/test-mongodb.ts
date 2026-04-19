// Run: node test\test-mongodb.ts

import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("✅ Connected to MongoDB");
        process.exit(0);
    } catch (err) {
        console.error("❌ Connection failed:", err);
        process.exit(1);
    }
}

testConnection();