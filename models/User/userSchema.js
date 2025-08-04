import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  isAdult: {
    type: Boolean,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/, // For Indian mobile numbers
  },
  password: {
    type: String,
    required: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  friendList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Friend",
      default: [],
    },
  ],
  friendRequest: [
    {
      type: Schema.Types.ObjectId,
      ref: "Friend",
      default: [],
    },
  ],
  clubLikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      default: [],
    },
  ],
  eventsBookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventBooking",
      default: [],
    },
  ],
  dailyBookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyBooking",
      default: [],
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
