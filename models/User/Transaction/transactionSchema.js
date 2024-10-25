import mongoose from "mongoose";

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    transaction: [
      {
        default: [],
        receiver: {
          type: Schema.Types.ObjectId,
          ref: "Club",
          requried: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        transactionID: {
          required: true,
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction',transactionSchema);
export default Transaction;