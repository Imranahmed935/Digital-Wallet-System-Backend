/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import Transaction from "../transaction/tx.model";
import AppError from "../../errorHelpers/AppError";
import { sendResponse } from "../../utils/sendResponse";


export const getUsersWithDailyStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const users = await User.find({ role: "USER" });

    const match: any = { role: "USER" };
    if (startDate) match.createdAt = { $gte: new Date(startDate as string) };
    if (endDate)
      match.createdAt = { ...match.createdAt, $lte: new Date(endDate as string) };


    const dailyUsers = await User.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Users and daily stats retrieved successfully",
      data: {
        users,
        dailyUsers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users and daily stats",
      error,
    });
  }
};

export const getAllAgents = async (req: Request, res: Response) => {
  try {
  
    const agents = await User.find({ role: "AGENT" });

    const dailyAgents = await User.aggregate([
      { $match: { role: "AGENT" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Agents retrieved successfully",
      data: {
        agents,
        dailyAgents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
      error,
    });
  }
};

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

export const getAllTransactionsWithDaily = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      minAmount,
      maxAmount,
      search,
      startDate,
      endDate,
    } = req.query;

    const query: any = {};

    // Filters
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
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Search
    const rawSearch = search;
    const searchStr = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch;
    if (searchStr && typeof searchStr === "string" && searchStr.trim() !== "") {
      const regex = new RegExp(searchStr, "i");
      query.$or = [
        { type: regex },
        { status: regex },
        ...(isNaN(Number(searchStr)) ? [] : [{ amount: Number(searchStr) }]),
        ...(isNaN(Date.parse(searchStr))
          ? []
          : [
              {
                createdAt: {
                  $gte: new Date(searchStr),
                  $lte: new Date(new Date(searchStr).setHours(23, 59, 59, 999)),
                },
              },
            ]),
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Paginated transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

     const meta= {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      }

    // Daily aggregation
    const dailyTransactions = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          count: 1,
          totalAmount: 1,
        },
      },
    ]);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        dailyTransactions,
      },
      meta
    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: "Failed to fetch transactions",
      data: {
        transactions: [],
        dailyTransactions: [],
      },
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




