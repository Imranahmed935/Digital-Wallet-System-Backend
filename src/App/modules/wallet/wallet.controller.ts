import { Request, Response } from "express";
import mongoose from "mongoose";


import Transaction from "../transaction/tx.model";
import { Wallet } from "./wallet.model";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";


export const addMoney = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, amount } = req.body;
    if (amount <= 0) throw new AppError(400, "Amount must be greater than 0");

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new AppError(404, "Wallet not found");

    wallet.balance += amount;
    await wallet.save({ session });

    await Transaction.create(
      [
        {
          type: "DEPOSIT",
          amount,
          fee: 0,
          commission: 0,
          toWallet: wallet._id,
          initiatedBy: userId,
          status: "COMPLETED",
          meta: { description: "Top-up added" },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Money added successfully", wallet });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Add money failed", error: error.message });
  }
};


export const withdrawMoney = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, amount } = req.body;
    if (amount <= 0) throw new AppError(400, "Amount must be greater than 0");

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new AppError(404, "Wallet not found");
    if (wallet.balance < amount) throw new AppError(400, "Insufficient balance");
 
    const transactionFee = Number(envVars.TRANSACTION_FEE);
    const newFee = (transactionFee / 100) * amount;

    wallet.balance -= (amount + newFee);
    await wallet.save({ session });

    await Transaction.create(
      [
        {
          type: "WITHDRAW",
          amount,
          fee: newFee,
          commission: 0,
          fromWallet: wallet._id,
          initiatedBy: userId,
          status: "COMPLETED",
          meta: { description: "Money withdrawn" },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Money withdrawn successfully", wallet });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Withdraw failed", error: error.message });
  }
};


export const sendMoney = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, receiverId, amount } = req.body;
    if (amount <= 0) throw new AppError(400, "Amount must be greater than 0");
    if (senderId === receiverId) throw new AppError(400, "Cannot send money to self");

    const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
    const receiverWallet = await Wallet.findOne({ userId: receiverId }).session(session);

    if (!senderWallet || !receiverWallet) throw new AppError(404, "Wallet not found");
    if (senderWallet.balance < amount) throw new AppError(400, "Insufficient balance");

    const transactionFee = Number(envVars.TRANSACTION_FEE);
    const newFee = (transactionFee / 100) * amount;

  
    senderWallet.balance -= (amount + newFee);
    await senderWallet.save({ session });


    receiverWallet.balance += amount;
    await receiverWallet.save({ session });

 
    await Transaction.create(
      [
        {
          type: "TRANSFER",
          amount,
          fee: newFee,
          commission: 0,
          fromWallet: senderWallet._id,
          toWallet: receiverWallet._id,
          initiatedBy: senderId,
          status: "COMPLETED",
          meta: { description: "Money sent to another user" },
        },
        {
          type: "CASH_IN",
          amount,
          fee: 0,
          commission: 0,
          fromWallet: senderWallet._id,
          toWallet: receiverWallet._id,
          initiatedBy: receiverId,
          status: "COMPLETED",
          meta: { description: "Money received from another user" },
        },
      ],
      { session, ordered:true }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Money sent successfully", senderWallet, receiverWallet });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Send money failed", error: error.message });
  }
};

// View Transaction History
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new AppError(404, "Wallet not found");

    const transactions = await Transaction.find({
      $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to fetch transactions", error: error.message });
  }
};
