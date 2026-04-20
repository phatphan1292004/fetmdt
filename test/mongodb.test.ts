import "dotenv/config";
import mongoose from "mongoose";

describe("MongoDB Connection", () => {
    it("should connect to MongoDB successfully", async () => {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined");
        }

        await mongoose.connect(MONGODB_URI);

        const state = mongoose.connection.readyState;

        // 1 = connected
        expect(state).toBe(1);

        await mongoose.disconnect();
    });
});