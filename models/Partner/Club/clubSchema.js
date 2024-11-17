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
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
      },
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
        required: false,
      },
    },
  ],
  price: {
    single: {
      type: Number,
      required: false,
    },
    couple: {
      type: Number,
      required: false,
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
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
  },
});

// Creating a geospatial index on the coordinates field
ClubSchema.index({ "location.coordinates": "2dsphere" });

const Club = mongoose.model("Club", ClubSchema);
export default Club;
