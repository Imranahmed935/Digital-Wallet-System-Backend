import { Request, Response } from "express";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import Transaction from "../transaction/tx.model";
import AppError from "../../errorHelpers/AppError";





// View all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({role:"USER"});
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users", error});
  }
};


export const getAllAgents = async (req: Request, res: Response) => {
  try {
    
    const agents = await User.find({role:"AGENT"});

    res.status(200).json({ success: true, agents: agents });
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
    res.status(500).json({ success: false, message: "Failed to fetch wallets", error });
  }
};

// View all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find()
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch transactions", error });
  }
};


export const blockWallet = async (req: Request, res: Response) => {
  try {
    const { walletId, block } = req.body; 
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new AppError(404, "Wallet not found");

    wallet.isBlocked = block;
    await wallet.save();

    res.status(200).json({ success: true, message: `Wallet ${block ? "blocked" : "unblocked"}`, wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update wallet status", error});
  }
};


export const updateAgentStatus = async (req: Request, res: Response) => {
  try {
    const { agentId, isActive } = req.body;
    console.log(agentId)
    const agent = await User.findById(agentId);
    if (!agent) throw new AppError(404, "Agent not found");

    agent.isActive = isActive;
    await agent.save();

    res.status(200).json({ 
      success: true, 
      message: `Agent is now ${agent.isActive ? "approved" : "suspended"}`, 
      agent 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to update agent status", 
      error
    });
  }
};


