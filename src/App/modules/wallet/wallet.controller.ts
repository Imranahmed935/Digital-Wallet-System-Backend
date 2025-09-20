/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import mongoose from "mongoose";
import Transaction from "../transaction/tx.model";
import { Wallet } from "./wallet.model";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";
import { User } from "../user/user.model";
import { sendResponse } from "../../utils/sendResponse";
// import { IPaginatedResponse, ITransaction } from "../transaction/tx.interface";



export const addMoney = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { phone, amount } = req.body;

    if (!phone) throw new AppError(400, "User phone number is required");
    if (amount <= 0) throw new AppError(400, "Amount must be greater than 0");

   
    const user = await User.findOne({ phone }).session(session);
    if (!user) throw new AppError(404, "User not found");

  
    const wallet = await Wallet.findOne({ userId: user._id }).session(session);
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
          initiatedBy: user._id,
          status: "COMPLETED",
          meta: { description: "Top-up added via phone number" },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Money added successfully", wallet });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Add money failed", error });
  }
};


export const withdrawMoney = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { phone, amount } = req.body;

    if (!phone) throw new AppError(400, "User phone number is required");
    if (!amount || amount <= 0) throw new AppError(400, "Amount must be greater than 0");

   
    const user = await User.findOne({ phone }).session(session);
    if (!user) throw new AppError(404, "User not found");

   
    const wallet = await Wallet.findOne({ userId: user._id }).session(session);
    if (!wallet) throw new AppError(404, "Wallet not found");

    
    const transactionFee = Number(envVars.TRANSACTION_FEE) || 0;
    const feeAmount = (transactionFee / 100) * amount;
    const totalDeduction = amount + feeAmount;

    if (wallet.balance < totalDeduction) throw new AppError(400, "Insufficient balance");

   
    wallet.balance -= totalDeduction;
    await wallet.save({ session });

    
    await Transaction.create(
      [
        {
          type: "WITHDRAW",
          amount,
          fee: feeAmount,
          commission: 0,
          fromWallet: wallet._id,
          initiatedBy: user._id,
          status: "COMPLETED",
          meta: { description: `Money withdrawn by ${phone}` },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Money withdrawn successfully",
      wallet,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: error.message || "Withdraw failed",
      error,
    });
  }
};

export const sendMoney = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { receiverPhone, amount } = req.body;
    const senderId = req.user?.userId;

    if (!receiverPhone) throw new AppError(400, "Receiver phone number is required");
    if (!amount || amount <= 0) throw new AppError(400, "Amount must be greater than 0");

    
    const sender = await User.findById(senderId).session(session);
    if (!sender) throw new AppError(404, "Sender not found");

  
    const receiver = await User.findOne({ phone: receiverPhone }).session(session);
    if (!receiver) throw new AppError(404, "Receiver not found");

   
    if (String(sender._id) === String(receiver._id)) {
      throw new AppError(400, "Cannot send money to self");
    }

 
    const senderWallet = await Wallet.findOne({ userId: sender._id }).session(session);
    const receiverWallet = await Wallet.findOne({ userId: receiver._id }).session(session);

    if (!senderWallet || !receiverWallet) throw new AppError(404, "Wallet not found");

 
    const transactionFee = Number(envVars.TRANSACTION_FEE) || 0;
    const newFee = (transactionFee / 100) * amount;
    const totalDeduction = amount + newFee;

    if (senderWallet.balance < totalDeduction) throw new AppError(400, "Insufficient balance");

    
    senderWallet.balance -= totalDeduction;
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
          initiatedBy: sender._id,
          status: "COMPLETED",
          meta: { description: `Money sent to ${receiver.phone}` },
        },
        {
          type: "CASH_IN",
          amount,
          fee: 0,
          commission: 0,
          fromWallet: senderWallet._id,
          toWallet: receiverWallet._id,
          initiatedBy: receiver._id,
          status: "COMPLETED",
          meta: { description: `Money received from ${sender.phone}` },
        },
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Money sent successfully to ${receiver.phone}`,
      senderWallet,
      receiverWallet,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: error.message || "Send money failed",
      error,
    });
  }
};


export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { userId: string }).userId;

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const type = req.query.type as string; // CASH_IN, CASH_OUT
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new AppError(404, "Wallet not found");

    // Build query
    const query: any = {
      $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
    };

    if (type) query.type = type;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count
    const total = await Transaction.countDocuments(query);

    // Response
    const response = {
      statusCode: 200,
      success: true,
      message: "Transactions retrieved successfully",
      data: transactions,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    sendResponse(res, response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error,
    });
  }
};

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.userId; 
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Wallet retrieved successfully",
      data: wallet,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to retrieve wallet" });
  }
};




