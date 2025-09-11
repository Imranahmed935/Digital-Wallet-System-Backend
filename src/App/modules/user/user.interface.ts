import { Types } from "mongoose";

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}


export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  isActive?:boolean;
}
