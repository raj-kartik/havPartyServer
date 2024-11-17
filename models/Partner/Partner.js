import mongoose, { Schema } from "mongoose";

const PartnerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    position: {
      type: String,
      required: true,
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", PartnerSchema);
