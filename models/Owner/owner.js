import mongoose, { Schema } from "mongoose";

// need to look into this once
const ownerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact_number: {
    type: String,
    required: true,
  },
  clubs_owned: [
    {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
  ],
  registration_date: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
  transactions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
    },
  ],
  password: {
    type: String,
    required: true,
  },
});

// Prevent model overwrite in dev environment
const Owner = mongoose.models.Owner || mongoose.model("Owner", ownerSchema);

export default Owner;
