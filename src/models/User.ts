import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Invalid email format"
            ],
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "Invalid phone number"], // +84 (vn)
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ["nguoi_tim_tro", "nguoi_cho_thue_tro"],
            required: true,
        },

        isVerified: { // Đã xác minh tài khoản qua gmail hoặc phone hay chưa
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["pending", "active", "blocked"],
            default: "pending", // Chờ xác minh qua email hoặc phone -> active
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);