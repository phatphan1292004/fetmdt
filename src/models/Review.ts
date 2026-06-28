import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  userName: string;
  userAvatarUrl?: string;
  postId: Types.ObjectId;
  postTitle: string;
  rating: number; // 1 to 5 stars
  content: string;
  status: "pending" | "approved" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userAvatarUrl: {
      type: String,
      trim: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    postTitle: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "approved", // auto approved, but can be moderated by admin
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

// Prevent cached model issues in development
if (process.env.NODE_ENV === "development" && mongoose.models.Review) {
  delete mongoose.models.Review;
}

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
