import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "./user.model";
import { Wallet } from "../wallet/wallet.model";
import Transaction from "../transaction/tx.model";
import bcryptjs from "bcryptjs";
import { Role } from "./user.interface";
import AppError from "../../errorHelpers/AppError";

const createUser = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password, role } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) throw new AppError(400, "User already exists!!");


    const hashedPass = await bcryptjs.hash(password, 10);


    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === Role.ADMIN) throw new AppError(403, "Admin registration not allowed!!");


    const newUser = await User.create(
      [{ name, email, password: hashedPass, role: normalizedRole }],
      { session }
    );


    const initialBalance = 50;


    const newWallet = await Wallet.create(
      [{ userId: newUser[0]._id, balance: initialBalance }],
      { session }
    );

    await Transaction.create(
      [
        {
          type: "DEPOSIT",
          amount: initialBalance,
          fee: 0,
          commission: 0,
          toWallet: newWallet[0]._id,
          initiatedBy: newUser[0]._id,
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

    res.status(201).json({
      success: true,
      message: "User, Wallet & Signup Transaction created successfully",
      data: {
        user: newUser[0],
        wallet: newWallet[0],
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: "Failed to create user, wallet & transaction",
      error: error.message,
    });
  }
};

export const userControllers = {
  createUser,
};
