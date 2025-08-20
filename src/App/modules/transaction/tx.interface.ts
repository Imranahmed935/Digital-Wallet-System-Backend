import { Types } from "mongoose";

export type TxType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'CASH_IN' | 'CASH_OUT';
export type TxStatus = 'PENDING' | 'COMPLETED' | 'REVERSED' | 'FAILED';

export interface ITransaction {
  type: TxType;
  amount: number;
  fee: number;
  commission: number;
  fromWallet?: Types.ObjectId;
  toWallet?: Types.ObjectId;
  initiatedBy: Types.ObjectId;
  status: TxStatus;
  meta?: Record<string, unknown>;
}