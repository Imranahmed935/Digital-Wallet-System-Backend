import { Types } from "mongoose";

export interface IAgent {
  userId: Types.ObjectId;      
  name: string;
  email: string;
  role:string,
  commissionRate: number;       
  isActive: boolean;
}
