import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
            index: true,
        },
        reason: {
            type: String,
            required: true,
            enum: ["spam", "fake", "wrong_price", "scam", "other"],
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "resolved", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
