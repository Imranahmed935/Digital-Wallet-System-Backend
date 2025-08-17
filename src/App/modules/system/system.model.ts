import { model, Schema } from "mongoose";
import { ISystemParams } from "./system.interface";

const systemSchema = new Schema<ISystemParams>({
  key: { type: String, unique: true },
  values: {
    transferFeePct: { type: Number, default: 0.005 },
    withdrawFeePct: { type: Number, default: 0.01 },
    agentCashInCommissionPct: { type: Number, default: 0.005 },
    agentCashOutCommissionPct: { type: Number, default: 0.005 },
    minBalance: { type: Number, default: 0 },
    dailyTransferLimit: { type: Number, default: 100000 },
  },
}, { timestamps: true });

export const SystemParams = model<ISystemParams>('SystemParams', systemSchema);
