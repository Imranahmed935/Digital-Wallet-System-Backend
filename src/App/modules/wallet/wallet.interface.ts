import { Types } from "mongoose";

export interface IWallet {
  userId: Types.ObjectId;
  balance: number;
  isBlocked: boolean;
}
