import mongoose from "mongoose";
const { Schema } = mongoose;

const DrinkSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    small: {
      type: Number,
      required: false,
    },
    medium: {
      type: Number,
      required: false,
    },
    large: {
      type: Number,
      required: false,
    },
  },
});

const FoodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: false,
  },
});

const MenuSchema = new Schema({
  drinks: {
    type: [DrinkSchema],
    default: [],
  },
  foods: {
    type: [FoodSchema],
    default: [],
  },
  beverages: {
    type: [String],
    default: [],
  },
});

const OfferSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discount: {
    type: Number, // Percentage discount (e.g., 20 for 20% off)
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  terms: {
    type: String,
    default: "",
  },
});

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
      default: "",
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
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
  },
  photos: {
    type: [String],
    default: [],
  },
  menu: {
    type: MenuSchema,
    default: {},
  },
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
  license: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
  offers: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: [],
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
});

// Creating a geospatial index on the coordinates field
ClubSchema.index({ "location.coordinates": "2dsphere" });

const Club = mongoose.model("Club", ClubSchema);
export default Club;
