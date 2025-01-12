import mongoose from "mongoose";

const { Schema } = mongoose;

const Event = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  limits: {
    type: Number,
    required: true,
  },
  clubId: {
    type: Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },
  dates: [
    {
      date: {
        type: Date, // Each date the event occurs
        required: true,
      },
      timeSlots: [
        {
          startTime: {
            type: String, // 24-hour format, e.g., "09:00"
            required: true,
          },
          endTime: {
            type: String, // 24-hour format, e.g., "11:00"
            required: true,
          },
        },
      ],
    },
  ],
  location: {
    type: String, // Address or venue details
    required: true,
  },
  instruction: {
    type: [String],
    default: [],
  },
  images: {
    type: [String], // URLs for event images
    default: [],
  },
  organizer: {
    type: String, // Organizer's name or details
    required: true,
  },
  attendees: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String, // Example: "Confirmed", "Pending"
        default: "Pending",
      },
    },
  ],
  status: {
    type: String, // Example: "Active", "Cancelled", "Completed"
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Event", Event);
