import mongoose from "mongoose";

const { Schema } = mongoose;

const friendSchema = new Schema({
  requester: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",  
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],  
    default: "pending",
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

friendSchema.pre("save", function(next) {
  this.updatedAt = Date.now();  
  next();
});

const Friend = mongoose.model("Friend", friendSchema);

export default Friend;
