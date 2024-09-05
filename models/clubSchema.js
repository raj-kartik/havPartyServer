import mongoose from "mongoose";
const { Schema } = mongoose;

const ClubSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
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
  photos: {
    type: [String],
    default: []
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
      default: []
    },
    foods: {
      type: [String],
      default: []
    },
  }
});

export default mongoose.model('Club', ClubSchema);
