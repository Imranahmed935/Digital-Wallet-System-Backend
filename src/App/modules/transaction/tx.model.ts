import { model, Schema } from "mongoose";
import { ITransaction } from "./tx.interface";

const txSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAW", "TRANSFER", "CASH_IN", "CASH_OUT"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    fee: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    fromWallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    toWallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "REVERSED", "FAILED"],
      default: "COMPLETED",
    },
    meta: { type: Object },
  },
  { timestamps: true }
);

const Transaction = model<ITransaction>("Transaction", txSchema);
export default Transaction;
