import mongoose from "mongoose";
const { Schema } = mongoose;

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
    type: Number,
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
  clubId:{
    type: Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  }
});

const Offer = mongoose.model("Offer", OfferSchema);
export default Offer;