/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import Transaction from "../transaction/tx.model";
import AppError from "../../errorHelpers/AppError";
import { sendResponse } from "../../utils/sendResponse";

// View all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: "USER" });
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch users", error });
  }
};

export const getAllAgents = async (req: Request, res: Response) => {
  try {
    const agents = await User.find({ role: "AGENT" });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully",
      data: agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
      error,
    });
  }
};

// View all wallets
export const getAllWallets = async (req: Request, res: Response) => {
  try {
    const wallets = await Wallet.find();
    res.status(200).json({ success: true, wallets });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch wallets", error });
  }
};

// View all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      minAmount,
      maxAmount,
      search,
    } = req.query;

    const query: any = {};

    if (status && String(status).trim() !== "") {
      query.status = (status as string).toUpperCase();
    }
    if (category && String(category).trim() !== "") {
      query.type = (category as string).toUpperCase();
    }
    if (minAmount && !isNaN(Number(minAmount))) {
      query.amount = { ...query.amount, $gte: Number(minAmount) };
    }
    if (maxAmount && !isNaN(Number(maxAmount))) {
      query.amount = { ...query.amount, $lte: Number(maxAmount) };
    }
    const rawSearch = req.query.search;
const search1 = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch;

if (search1 && typeof search1 === "string" && search1.trim() !== "") {
  const searchRegex = new RegExp(search1, "i");

  query.$or = [
    { type: searchRegex },
    { status: searchRegex },

    // Amount: include if numeric
    ...(isNaN(Number(search)) ? [] : [{ amount: Number(search1) }]),

    // CreatedAt: only if it's a valid date
    ...(isNaN(Date.parse(search1))
      ? []
      : [
          {
            createdAt: {
              $gte: new Date(search1),
              $lte: new Date(new Date(search1).setHours(23, 59, 59, 999)),
            },
          },
        ]),
  ];
}


    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    const meta = {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    };

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Transactions retrieved successfully",
      data: transactions,
      meta,
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: "Failed to fetch transactions",
      data: [],
    });
  }
};

export const blockWallet = async (req: Request, res: Response) => {
  try {
    const { walletId, block } = req.body;
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new AppError(404, "Wallet not found");

    wallet.isBlocked = block;
    await wallet.save();

    res.status(200).json({
      success: true,
      message: `Wallet ${block ? "blocked" : "unblocked"}`,
      wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update wallet status",
      error,
    });
  }
};

// Block user
export const toggleUserBlock = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      throw new AppError(400, "userId is required");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Toggle the status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "unblocked" : "blocked"} successfully`,
      user,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
};

export const toggleAgentStatus = async (req: Request, res: Response) => {
  try {
    const agentId = req?.params?.id;
    if (!agentId) {
      throw new AppError(400, "agentId is required");
    }
    const agent = await User.findById(agentId);
    if (!agent) {
      throw new AppError(404, "Agent not found");
    }
    agent.isActive = !agent.isActive;
    await agent.save();

    res.status(200).json({
      success: true,
      message: `Agent ${
        agent.isActive ? "approved" : "suspended"
      } successfully`,
      agent,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update agent status",
    });
  }
};




