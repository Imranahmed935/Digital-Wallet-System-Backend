
import { Types } from "mongoose";

export type TxType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'CASH_IN' | 'CASH_OUT';
export type TxStatus = 'PENDING' | 'COMPLETED' | 'REVERSED' | 'FAILED';

export interface IMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

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

export interface IPaginatedResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: IMeta;
}export interface IMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
