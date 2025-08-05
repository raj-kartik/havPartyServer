import mongoose, { Schema } from "mongoose";

const dailyRegistrationSchema = new Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  month: Number,
  year: Number,
  week: Number,
}, { timestamps: true });

// Auto-fill time breakdown
dailyRegistrationSchema.pre("save", function (next) {
  const d = this.date || new Date();
  this.month = d.getMonth() + 1;
  this.year = d.getFullYear();
  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const startDay = startOfMonth.getDay();
  this.week = Math.ceil((d.getDate() + startDay) / 7);
  next();
});

const DailyRegistration =
  mongoose.models.DailyRegistration || mongoose.model("DailyRegistration", dailyRegistrationSchema);

export default DailyRegistration;
