import mongoose from "mongoose";
const { Schema } = mongoose;

// Drink subdocument schema
const DrinkSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    small: { type: Number },
    medium: { type: Number },
    large: { type: Number },
  },
});

// Food subdocument schema
const FoodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
  },
});

// Menu schema (nested in Club)
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

// Offer schema (separate collection, used as ref in Club)
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
    type: Number, // e.g., 20 for 20% off
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

export const Offer =
  mongoose.models.Offer || mongoose.model("Offer", OfferSchema);

// Club main schema
const ClubSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  openTiming: {
    type: String, // Format: "HH:mm"
    required: true,
  },
  closeTiming: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return v !== this.openTiming;
      },
      message: "Closing time cannot be the same as opening time",
    },
  },

  location: {
    address1: { type: String, required: true },
    address2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
  },
  photos: {
    type: [String],
    default: [],
  },
  menu: {
    type: MenuSchema,
    default: () => ({}),
  },
  price: {
    single: { type: Number },
    couple: { type: Number },
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
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: "Partner",
    required: false,
  },
  maxClubCapacity: {
    type: Number,
  },
  clubCapacity:{
    type: Number,
    default: 0,
  },
  offers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Offer",
    },
  ],
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Geo index for location
ClubSchema.index({ "location.coordinates": "2dsphere" });

const Club = mongoose.models.Club || mongoose.model("Club", ClubSchema);

export default Club;
