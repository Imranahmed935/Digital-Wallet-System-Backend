import { Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.model";
import Transaction from "../transaction/tx.model";


// Cash-in: Add money to any user's wallet
export const cashIn = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { agentId, userId, amount } = req.body;
    if (amount <= 0) throw new AppError(400, "Amount must be greater than 0");

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new AppError(404, "User wallet not found");

    // Add money to wallet
    wallet.balance += amount;
    await wallet.save({ session });

    // Record transaction
    await Transaction.create(
      [
        {
          type: "CASH_IN",
          amount,
          fee: 0,
          commission: 0, // optionally compute agent commission
          toWallet: wallet._id,
          initiatedBy: agentId,
          status: "COMPLETED",
          meta: { description: "Cash-in by agent" },
        },
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Cash-in successful", wallet });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Cash-in failed", error: error.message });
  }
};

// Cash-out: Withdraw money from any user's wallet
export const cashOut = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { agentId, userId, amount } = req.body;
    if (amount <= 0) throw new AppError(400, "Amount must be greater than 0");

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new AppError(404, "User wallet not found");
    if (wallet.balance < amount) throw new AppError(400, "Insufficient balance");

    // Deduct money from wallet
    wallet.balance -= amount;
    await wallet.save({ session });

    // Record transaction
    await Transaction.create(
      [
        {
          type: "CASH_OUT",
          amount,
          fee: 0,
          commission: 0, // optionally compute agent commission
          fromWallet: wallet._id,
          initiatedBy: agentId,
          status: "COMPLETED",
          meta: { description: "Cash-out by agent" },
        },
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Cash-out successful", wallet });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Cash-out failed", error: error.message });
  }
};

// Optional: View agent's commission transactions
export const getCommissionHistory = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const transactions = await Transaction.find({ initiatedBy: agentId, type: { $in: ["CASH_IN","CASH_OUT"] } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch commission history", error: error.message });
  }
};
