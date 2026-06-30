import mongoose, { Model, Schema, Types } from "mongoose";

export interface ContractDocument {
  _id?: Types.ObjectId;
  landlordId: Types.ObjectId;
  tenantId?: Types.ObjectId;
  type: "electronic" | "paper";
  renterName: string;
  renterPhone: string;
  renterCccd?: string;
  renterAddress?: string;
  landlordName: string;
  landlordCccd?: string;
  landlordAddress?: string;
  landlordCccdIssuedPlace?: string;
  roomNumber: string;
  address: string;
  price: string;
  priceNumber: number;
  priceText?: string;
  deposit: string;
  depositNumber: number;
  depositText?: string;
  periodMonths: number;
  period: string;
  startDate: Date;
  endDate: Date;
  status: string;
  sha256?: string;
  paperImageLandlord?: string | null;
  paperImageTenant?: string | null;
  signerA?: string;
  signerB?: string;
  postId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContractSchema = new Schema<ContractDocument>(
  {
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    type: {
      type: String,
      enum: ["electronic", "paper"],
      required: true,
    },
    renterName: {
      type: String,
      required: true,
      trim: true,
    },
    renterPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    renterCccd: {
      type: String,
      trim: true,
    },
    renterAddress: {
      type: String,
      trim: true,
    },
    landlordName: {
      type: String,
      required: true,
      trim: true,
    },
    landlordCccd: {
      type: String,
      trim: true,
    },
    landlordAddress: {
      type: String,
      trim: true,
    },
    landlordCccdIssuedPlace: {
      type: String,
      trim: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    priceNumber: {
      type: Number,
      required: true,
    },
    priceText: {
      type: String,
      trim: true,
    },
    deposit: {
      type: String,
      required: true,
      trim: true,
    },
    depositNumber: {
      type: Number,
      required: true,
    },
    depositText: {
      type: String,
      trim: true,
    },
    periodMonths: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    sha256: {
      type: String,
      trim: true,
    },
    paperImageLandlord: {
      type: String,
      default: null,
    },
    paperImageTenant: {
      type: String,
      default: null,
    },
    signerA: {
      type: String,
      trim: true,
    },
    signerB: {
      type: String,
      trim: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  {
    timestamps: true,
  }
);

const Contract: Model<ContractDocument> =
  mongoose.models.Contract || mongoose.model<ContractDocument>("Contract", ContractSchema);

export default Contract;
