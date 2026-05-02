import mongoose from "mongoose";

const UserActivitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        metadata: {
            type: Object,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.UserActivity || mongoose.model("UserActivity", UserActivitySchema);
