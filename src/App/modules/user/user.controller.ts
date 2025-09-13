/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import AppError from "../../errorHelpers/AppError";
import { Role } from "./user.interface";
import { User } from "./user.model";
import { Wallet } from "../wallet/wallet.model";
import Transaction from "../transaction/tx.model";
import { IWallet } from "../wallet/wallet.interface";
import { sendResponse } from "../../utils/sendResponse";


const createUser = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password, phone, role } = req.body;

    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === Role.ADMIN) {
      throw new AppError(403, "Admin registration not allowed!");
    }

    const existUser = await User.findOne({ email });
    if (existUser) throw new AppError(400, "User already exists!");

    const hashedPass = await bcryptjs.hash(password, 10);

    const newUserArray = await User.create(
      [{ name, email, phone, password: hashedPass, role: normalizedRole }],
      { session }
    );

    const newUser = newUserArray[0].toObject();

    // Wallet payload
    let walletPayload: IWallet;

    if (normalizedRole === Role.USER) {
      walletPayload = { userId: newUser._id, balance: 50 };
    } else if (normalizedRole === Role.AGENT) {
      walletPayload = { agentId: newUser._id, balance: 50 };
    } else {
      throw new AppError(400, "Invalid role");
    }

    const newWallet = await Wallet.create([walletPayload], { session });

    await Transaction.create(
      [
        {
          type: "DEPOSIT",
          amount: 50,
          fee: 0,
          commission: 0,
          toWallet: newWallet[0]._id,
          initiatedBy: newUser._id,
          status: "COMPLETED",
          meta: {
            description: "Signup bonus credited automatically",
            source: "SYSTEM",
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: `${normalizedRole} registered successfully with wallet!`,
      data: {
        user: userWithoutPassword,
        wallet: newWallet[0],
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: "Failed to create user/agent & wallet",
      error: error.message || error,
    });
  }
};
export const getMe = async (req: Request, res: Response) => {
  try {
    const email = req.user.email;
    if (!email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await User.findOne({email}).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId; 

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    if (!user) throw new AppError(404, "User not found");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const userControllers = { createUser, getMe, updateUserProfile };
