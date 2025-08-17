import { model, Schema } from "mongoose";
import { IAgent } from "./agent.interface";

const agentSchema = new Schema<IAgent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    commissionRate: { type: Number, default: 2 }, 
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Agent = model<IAgent>("Agent", agentSchema);
