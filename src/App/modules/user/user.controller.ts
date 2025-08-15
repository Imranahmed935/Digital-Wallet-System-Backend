import { Request, Response } from "express";
import { User } from "./user.model";
import { Wallet } from "../wallet/wallet.model";

const createUser = async (req: Request, res: Response) => {
  const user = req.body;
  const newUser = await User.create(user);
  await Wallet.create({ userId: newUser._id, balance: 50 });
  res.status(200).json({
    success: true,
    message: "user & wallet created successfully",
    data: newUser,
  });
};

export const userControllers = {
  createUser,
};
