import mongoose, { Schema, model, Types } from "mongoose";

const timeSlotSchema = new Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

const entrySchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ["stags", "couples", "girls"], // or allow dynamic types if needed
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const dateSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  entry: [entrySchema],
  timeSlots: [timeSlotSchema],
});

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
    dates: [dateSchema],
    location: {
      type: String,
      required: false, // 👈 location is optional
    },
    instruction: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    isDelete:{
      type: Boolean,
      default: false,
    },
    organizer: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "createdByModel",
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ["owner", "manager", "employee"], // Assuming these are the models that can create events
    },
  },
  {
    timestamps: true,
  }
);

// Allow only Managers (if createdBy is Employee)
eventSchema.pre("save", async function (next) {
  if (this.createdByModel === "Employee") {
    const Employee = mongoose.model("Employee");
    const employee = await Employee.findById(this.createdBy);
    if (!employee || employee.position !== "Manager") {
      return next(
        new Error("Only employees with Manager position can create events.")
      );
    }
  }
  next();
});

export const Event = model("Event", eventSchema);
