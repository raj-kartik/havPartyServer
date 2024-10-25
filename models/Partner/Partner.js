import mongoose, { Schema } from "mongoose";

const partnerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contact_number: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  registered_date: {
    type: Date,
    default: Date.now,
  },
  clubs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
});

const Partner = mongoose.model("Partner", partnerSchema);

export default Partner;
