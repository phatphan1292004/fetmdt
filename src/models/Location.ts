import mongoose, { Model, Schema } from "mongoose";

type LocationDocument = {
  city: string;
  districts: string[];
};

const LocationSchema = new Schema<LocationDocument>(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    districts: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "locations",
  }
);

const LocationModel =
  (mongoose.models.Location as Model<LocationDocument>) ||
  mongoose.model<LocationDocument>("Location", LocationSchema);

export default LocationModel;