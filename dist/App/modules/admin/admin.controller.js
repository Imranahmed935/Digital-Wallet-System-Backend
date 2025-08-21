"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAgentStatus = exports.blockWallet = exports.getAllTransactions = exports.getAllWallets = exports.getAllAgents = exports.getAllUsers = void 0;
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const tx_model_1 = __importDefault(require("../transaction/tx.model"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
// View all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.User.find({ role: "USER" });
        res.status(200).json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch users", error });
    }
});
exports.getAllUsers = getAllUsers;
const getAllAgents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agents = yield user_model_1.User.find({ role: "AGENT" });
        res.status(200).json({ success: true, agents: agents });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch agents",
            error,
        });
    }
});
exports.getAllAgents = getAllAgents;
// View all wallets
const getAllWallets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallets = yield wallet_model_1.Wallet.find();
        res.status(200).json({ success: true, wallets });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch wallets", error });
    }
});
exports.getAllWallets = getAllWallets;
// View all transactions
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield tx_model_1.default.find();
        res.status(200).json({ success: true, transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch transactions", error });
    }
});
exports.getAllTransactions = getAllTransactions;
const blockWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletId, block } = req.body;
        const wallet = yield wallet_model_1.Wallet.findById(walletId);
        if (!wallet)
            throw new AppError_1.default(404, "Wallet not found");
        wallet.isBlocked = block;
        yield wallet.save();
        res.status(200).json({ success: true, message: `Wallet ${block ? "blocked" : "unblocked"}`, wallet });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to update wallet status", error });
    }
});
exports.blockWallet = blockWallet;
const updateAgentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { agentId, isActive } = req.body;
        console.log(agentId);
        const agent = yield user_model_1.User.findById(agentId);
        if (!agent)
            throw new AppError_1.default(404, "Agent not found");
        agent.isActive = isActive;
        yield agent.save();
        res.status(200).json({
            success: true,
            message: `Agent is now ${agent.isActive ? "approved" : "suspended"}`,
            agent
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update agent status",
            error
        });
    }
});
exports.updateAgentStatus = updateAgentStatus;
