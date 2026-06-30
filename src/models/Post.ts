import mongoose, { Model, Schema, Types } from "mongoose";

type PropertyType = "nha_o" | "can_ho_chung_cu" | "phong_tro";
type ListingType = "cho_thue";
type OwnerType = "ca_nhan" | "moi_gioi";
type PostStatus = "draft" | "pending" | "published" | "rejected" | "hidden";

export type PostDocument = {
  ownerId: Types.ObjectId;
  propertyType: PropertyType;
  listingType: ListingType;
  slug: string;
  projectName?: string;
  address: string;
  city?: string;
  district?: string;
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
  allowPets?: boolean;
  ownerType: OwnerType;
  mediaUrls: string[];
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  status: PostStatus;
  vipType?: "supervip" | "vip1" | "vip2" | "vip3" | "free";
  vipWeight?: number;
  vipExpireAt?: Date | null;
  lastPushedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  views?: number;
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
    city: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
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
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
    allowPets: {
      type: Boolean,
      default: undefined,
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
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "hidden"],
      default: "pending",
      required: true,
      index: true,
    },
    vipType: {
      type: String,
      enum: ["supervip", "vip1", "vip2", "vip3", "free"],
      default: "free",
      index: true,
    },
    vipWeight: {
      type: Number,
      default: 0,
      index: true,
    },
    vipExpireAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastPushedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "posts",
  },
);

PostSchema.index({ location: "2dsphere" });
PostSchema.index({ vipWeight: -1, lastPushedAt: -1 });

const PostModel =
  (mongoose.models.Post as Model<PostDocument>) ||
  mongoose.model<PostDocument>("Post", PostSchema);

export default PostModel;
