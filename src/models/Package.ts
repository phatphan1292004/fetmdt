import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "from-blue-500 to-indigo-600",
    },
    textColor: {
      type: String,
      default: "text-blue-600",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Package || mongoose.model("Package", PackageSchema);
