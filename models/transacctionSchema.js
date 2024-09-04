import mongoose from "mongoose";

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    transaction: [
      {
        default: [],
        receiver: {
          type: Schema.Types.ObjectId,
          ref: "Club",
          requrie: true,
        },
        amount: {
          type: Number,
          require: true,
        },
        transactionID: {
          require: true,
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction',transactionSchema);
export default Transaction;