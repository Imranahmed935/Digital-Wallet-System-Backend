import { Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.model";
import Transaction from "../transaction/tx.model";
import { User } from "../user/user.model";
import { sendResponse } from "../../utils/sendResponse";


export const cashIn = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { receiverPhone, amount } = req.body;
    const senderId = req.user?.userId; 

    if (!receiverPhone) throw new AppError(400, "Receiver phone number is required");
    if (amount <= 0) throw new AppError(400, "Amount must be greater than 0");

    const sender = await User.findById(senderId).session(session);
    if (!sender) throw new AppError(404, "Sender not found");

    const receiver = await User.findOne({ phone: receiverPhone }).session(session);
    if (!receiver) throw new AppError(404, "Receiver not found");

    if (String(sender._id) === String(receiver._id)) {
      throw new AppError(400, "Cannot send money to self");
    }

  
    const senderWallet = await Wallet.findOne({ agentId: sender._id }).session(session);
    const receiverWallet = await Wallet.findOne({ userId: receiver._id }).session(session);

    if (!senderWallet || !receiverWallet) throw new AppError(404, "Wallet not found");

   
    const feeRate = 0.02; 
    const commissionRate = 0.01; 

    const fee = amount * feeRate;
    const commission = amount * commissionRate;
    const totalDeduct = amount + fee;

    if (senderWallet.balance < totalDeduct) {
      throw new AppError(400, "Insufficient balance (amount + fee required)");
    }

   
    senderWallet.balance -= totalDeduct;
    await senderWallet.save({ session });

  
    receiverWallet.balance += amount;
    await receiverWallet.save({ session });

   
    senderWallet.balance += commission;
    await senderWallet.save({ session });

   
    await Transaction.create(
      [
        {
          type: "CASH_IN",
          amount,
          fee,
          commission,
          fromWallet: senderWallet._id,
          toWallet: receiverWallet._id,
          initiatedBy: sender._id,
          status: "COMPLETED",
          meta: { description: "Cash-in by agent" },
        },
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();
    session.endSession();

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cash-in successful",
      data: {
        senderWalletBalance: senderWallet.balance,
        receiverWalletBalance: receiverWallet.balance,
        fee,
        commission,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Cash-in failed",
      data: (error as Error).message,
    });
  }
};


export const cashOut = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userPhone, amount } = req.body;
    const agentId = req.user?.userId;

    if (!userPhone) throw new AppError(400, "User phone number is required");
    if (amount <= 0) throw new AppError(400, "Amount must be greater than 0");

    
    const feeRate = 0.02; 
    const commissionRate = 0.01; 
    const fee = amount * feeRate;
    const commission = amount * commissionRate;

    
    const agent = await User.findById(agentId).session(session);
    if (!agent) throw new AppError(404, "Agent not found");

    const userData = await User.findOne({ phone: userPhone }).session(session);
    if (!userData) throw new AppError(404, "User not found");

   
    const agentWallet = await Wallet.findOne({ agentId: agent._id }).session(session);
    if (!agentWallet) throw new AppError(404, "Agent wallet not found");

    const userWallet = await Wallet.findOne({ userId: userData._id }).session(session);
    if (!userWallet) throw new AppError(404, "User wallet not found");


    const totalDeduction = amount + fee;
    if (userWallet.balance < totalDeduction)
      throw new AppError(400, `Insufficient user balance (need at least ৳${totalDeduction})`);


    userWallet.balance -= totalDeduction;
    await userWallet.save({ session });

    agentWallet.balance += amount + commission; 
    await agentWallet.save({ session });

  
    await Transaction.create(
      [
        {
          type: "CASH_OUT",
          amount,
          fee,
          commission,
          fromWallet: userWallet._id,
          toWallet: agentWallet._id,
          initiatedBy: agentId,
          status: "COMPLETED",
          meta: {
            description: `Cash-out ৳${amount} (+৳${fee} fee, ৳${commission} commission) by agent ${agent.phone}`,
          },
        },
      ],
      { session }
    );
    await session.commitTransaction();
    session.endSession();

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Cash-out successful",
      data: {
        agent: {
          id: agent._id,
          phone: agent.phone,
          walletBalance: agentWallet.balance,
        },
        user: {
          id: userData._id,
          phone: userData.phone,
          walletBalance: userWallet.balance,
        },
        transaction: {
          amount,
          fee,
          commission,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Cash-out failed",
      data: (error as Error).message,
    });
  }
};


export const getCommissionHistory = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const transactions = await Transaction.find({
      initiatedBy: agentId,
      type: { $in: ["CASH_IN", "CASH_OUT"] },
    }).sort({ createdAt: -1 });

   sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "all transaction retrived successful",
      data: transactions
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch commission history",
        error,
      });
  }
};
