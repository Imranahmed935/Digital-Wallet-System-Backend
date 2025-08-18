
// import { Types } from "mongoose";

// export interface IWallet {
//   userId: Types.ObjectId;  
//   balance: number;
//   isBlocked: boolean;
// }
import { Types } from "mongoose";

export interface IWallet {
  userId?: Types.ObjectId;   // optional
  agentId?: Types.ObjectId;  // optional
  balance: number;
  isBlocked: boolean;
}