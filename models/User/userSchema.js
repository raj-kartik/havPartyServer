import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
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
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
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
  bookingHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserBookingHistory",
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
});

const User = mongoose.model("User", userSchema);
export default User;
