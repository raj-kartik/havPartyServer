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
      enum: ["stag", "couple", "girls"],
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
    numberOfPeople: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model("EventBooking", EventBookingSchema);
