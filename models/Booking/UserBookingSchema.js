// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const userBookingSchema = new Schema(
//   {
//     clubId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Club",
//       required: true,
//     },
//     bookingType: {
//       type: String,
//       enum: ["daily", "event", "reservation"],
//       default: "daily",
//     },
//     date: {
//       type: Date,
//       required: true,
//     },
//     timeSlot: {
//       type: String,
//       required: false, // e.g., "7:00 PM - 10:00 PM"
//     },
//     numberOfPeople: {
//       type: Number,
//       required: true,
//       min: 1,
//       default: 1,
//     },
//     entryType: {
//       type: String,
//       enum: ["stag", "couple", "girl"],
//       default: "stag",
//     },
//     amountPaid: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["unpaid", "partial", "paid"],
//       default: "unpaid",
//     },
//     bookingStatus: {
//       type: String,
//       enum: ["pending", "confirmed", "cancelled", "completed"],
//       default: "pending",
//     },
//     promoterId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Promoter",
//       required: false,
//     },
//     promoterName: {
//       type: String,
//       required: false,
//     },
//     specialRequests: {
//       type: String,
//       required: false,
//     },
//   },
//   {
//     timestamps: true, // adds createdAt and updatedAt automatically
//   }
// );

// export default mongoose.model("UserBooking", userBookingSchema);
