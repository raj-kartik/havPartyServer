import mongoose from "mongoose";

const { Schema } = mongoose;

const EventBookingSchema = new Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    entryType: {
      type: String,
      enum: ["stag", "couple", "girl"],
      default: "stag",
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "checked-in"],
      default: "pending",
    },
    promoterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promoter",
      required: false,
    },
    promoterName: {
      type: String,
      required: false,
    },
    numberOfPeople:{
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    // specialRequests: {
    //   type: String,
    //   required: false,
    //   trim: true,
    // },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("EventBooking", EventBookingSchema);
