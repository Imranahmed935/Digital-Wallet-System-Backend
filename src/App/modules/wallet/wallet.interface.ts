
import { Types } from "mongoose";

export interface IWallet {
  userId?: Types.ObjectId;   
  agentId?: Types.ObjectId;  
  balance: number;
  isBlocked: boolean;
}