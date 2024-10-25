import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  club_id: {
    type: Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  charges: {
    type: Number,
    default: 0,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
