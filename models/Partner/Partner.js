import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  clubs_owned: [
    {
      type: Schema.Types.ObjectId,
      ref: "Club", // Reference to the Club model
    },
  ],
  registration_date: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
  transactions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Ticket", // Reference to the Ticket model
    },
  ],
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "", // Optional field for storing profile picture URL
  }
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;