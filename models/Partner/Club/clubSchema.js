import mongoose from "mongoose";
const { Schema } = mongoose;

const ClubSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    address1: {
      type: String,
      required: true,
    },
    address2: {
      type: String,
      default: "", // Default to an empty string for consistency
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
  },
  photos: {
    type: [String],
    default: [],
  },
  offers: [
    {
      offer: {
        type: String,
        required: true,
      },
    },
  ],
  price: {
    single: {
      type: Number,
      required: true,
    },
    couple: {
      type: Number,
      required: true,
    },
  },
  menu: {
    drinks: {
      type: [String],
      default: [],
    },
    foods: {
      type: [String],
      default: [],
    },
    license: {
      type: String,
      required: true, // Corrected "require" to "required"
    },
    owner: {
      type: String,
      required: true, // Corrected "require" to "required"
    },
  },
});

const Club = mongoose.model("Club", ClubSchema);
export default Club;
