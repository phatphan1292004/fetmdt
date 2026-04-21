import mongoose, { Model, Schema, Types } from "mongoose";

type PropertyType = "nha_o" | "can_ho_chung_cu" | "phong_tro";
type ListingType = "cho_thue";
type OwnerType = "ca_nhan" | "moi_gioi";
type PostStatus = "draft" | "pending" | "published" | "rejected" | "hidden";

export type PostDocument = {
  ownerId: Types.ObjectId;
  propertyType: PropertyType;
  listingType: ListingType;
  projectName?: string;
  address: string;
  showRoomCode: boolean;
  title: string;
  description: string;
  price: number;
  deposit?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  width?: number;
  length?: number;
  floors?: number;
  usableArea?: number;
  mainDirection?: string;
  legalStatus?: string;
  interiorStatus?: string;
  feature?: string;
  details?: Record<string, unknown>;
  ownerType: OwnerType;
  mediaUrls: string[];
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
};

const PostSchema = new Schema<PostDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: ["nha_o", "can_ho_chung_cu", "phong_tro"],
      required: true,
    },
    listingType: {
      type: String,
      enum: ["cho_thue"],
      default: "cho_thue",
      required: true,
    },
    projectName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    showRoomCode: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 70,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    deposit: {
      type: Number,
      min: 0,
    },
    area: {
      type: Number,
      min: 0,
    },
    bedrooms: {
      type: Number,
      min: 0,
    },
    bathrooms: {
      type: Number,
      min: 0,
    },
    width: {
      type: Number,
      min: 0,
    },
    length: {
      type: Number,
      min: 0,
    },
    floors: {
      type: Number,
      min: 0,
    },
    usableArea: {
      type: Number,
      min: 0,
    },
    mainDirection: {
      type: String,
      trim: true,
    },
    legalStatus: {
      type: String,
      trim: true,
    },
    interiorStatus: {
      type: String,
      trim: true,
    },
    feature: {
      type: String,
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ownerType: {
      type: String,
      enum: ["ca_nhan", "moi_gioi"],
      default: "ca_nhan",
      required: true,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "hidden"],
      default: "pending",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "posts",
  }
);

const PostModel =
  (mongoose.models.Post as Model<PostDocument>) ||
  mongoose.model<PostDocument>("Post", PostSchema);

export default PostModel;