
import { model, Schema } from "mongoose";
import { IWallet } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    agentId: { type: Schema.Types.ObjectId, ref: "User" }, 
    balance: { type: Number, default: 50 },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
