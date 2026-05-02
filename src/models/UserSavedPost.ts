import mongoose from "mongoose";

const UserSavedPostSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);

UserSavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.models.UserSavedPost || mongoose.model("UserSavedPost", UserSavedPostSchema);
