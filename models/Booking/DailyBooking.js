import mongoose from "mongoose";

const { Schema } = mongoose;

const DailyBookingSchema = new Schema({
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
  date: {
    type: Date, // Could also use a custom format or string if needed
    required: true,
  },
  numOfCustomer: {
    type: Number,
    required: true,
    min: 1,
  },
  promotorName: {
    type: String,
    required: false,
  },
  // promotorId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Promotor", // adjust based on your schema
  //   required: false,
  // },
  bookingStatus: {
    type: String,
    enum: ["pending", "booked", "checked-in"],
    default: "pending",
  },
  bookingType: {
    type: String,
    enum: ["online", "walk-in"],
    default: "online",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  specialNotes: {
    type: String,
    required: false,
  },
});

export default mongoose.model("DailyBooking", DailyBookingSchema);
