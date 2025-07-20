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
    month: Number,
    year: Number,
    week: Number, // 1 to 5 (representing week number in month)
    source: {
      type: String,
      enum: ["instagram", "facebook", "website", "referral", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

// Auto-fill month, year, week
clubReachSchema.pre("save", function (next) {
  const d = this.date || new Date();
  this.month = d.getMonth() + 1;
  this.year = d.getFullYear();

  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const startDay = startOfMonth.getDay(); // Sunday = 0
  this.week = Math.ceil((d.getDate() + startDay) / 7); // Week 1 to 5

  next();
});

clubReachSchema.index({ clubId: 1, year: 1, month: 1, week: 1 });

const ClubReach =
  mongoose.models.ClubReach || mongoose.model("ClubReach", clubReachSchema);

export default ClubReach;
