import mongoose, { Schema } from "mongoose";

const clubReachSchema = new Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    reachCount: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    day: Number,
    month: Number,
    year: Number,
    weekOfMonth: Number,
    source: {
      type: String,
      enum: ["instagram", "facebook", "website", "referral", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

// Auto-fill day, month, year, weekOfMonth
clubReachSchema.pre("save", function (next) {
  const d = this.date || new Date();
  this.day = d.getDate();
  this.month = d.getMonth() + 1;
  this.year = d.getFullYear();

  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const dayOfWeek = startOfMonth.getDay(); // Sunday = 0
  this.weekOfMonth = Math.ceil((d.getDate() + dayOfWeek) / 7);

  next();
});

const ClubReach =
  mongoose.models.ClubReach || mongoose.model("ClubReach", clubReachSchema);

export default ClubReach;
