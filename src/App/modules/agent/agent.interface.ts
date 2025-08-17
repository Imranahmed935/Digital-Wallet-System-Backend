import { Types } from "mongoose";

export interface IAgent {
  userId: Types.ObjectId;      
  name: string;
  email: string;
  commissionRate: number;       
  isActive: boolean;
}
