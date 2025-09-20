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
exports.getWallet = exports.getTransactionHistory = exports.sendMoney = exports.withdrawMoney = exports.addMoney = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tx_model_1 = __importDefault(require("../transaction/tx.model"));
const wallet_model_1 = require("./wallet.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const env_1 = require("../../config/env");
const user_model_1 = require("../user/user.model");
const sendResponse_1 = require("../../utils/sendResponse");
// import { IPaginatedResponse, ITransaction } from "../transaction/tx.interface";
const addMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { phone, amount } = req.body;
        if (!phone)
            throw new AppError_1.default(400, "User phone number is required");
        if (amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        const user = yield user_model_1.User.findOne({ phone }).session(session);
        if (!user)
            throw new AppError_1.default(404, "User not found");
        const wallet = yield wallet_model_1.Wallet.findOne({ userId: user._id }).session(session);
        if (!wallet)
            throw new AppError_1.default(404, "Wallet not found");
        wallet.balance += amount;
        yield wallet.save({ session });
        yield tx_model_1.default.create([
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
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: "Money added successfully", wallet });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: "Add money failed", error });
    }
});
exports.addMoney = addMoney;
const withdrawMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { phone, amount } = req.body;
        if (!phone)
            throw new AppError_1.default(400, "User phone number is required");
        if (!amount || amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        const user = yield user_model_1.User.findOne({ phone }).session(session);
        if (!user)
            throw new AppError_1.default(404, "User not found");
        const wallet = yield wallet_model_1.Wallet.findOne({ userId: user._id }).session(session);
        if (!wallet)
            throw new AppError_1.default(404, "Wallet not found");
        const transactionFee = Number(env_1.envVars.TRANSACTION_FEE) || 0;
        const feeAmount = (transactionFee / 100) * amount;
        const totalDeduction = amount + feeAmount;
        if (wallet.balance < totalDeduction)
            throw new AppError_1.default(400, "Insufficient balance");
        wallet.balance -= totalDeduction;
        yield wallet.save({ session });
        yield tx_model_1.default.create([
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
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            message: "Money withdrawn successfully",
            wallet,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: error.message || "Withdraw failed",
            error,
        });
    }
});
exports.withdrawMoney = withdrawMoney;
const sendMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { receiverPhone, amount } = req.body;
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!receiverPhone)
            throw new AppError_1.default(400, "Receiver phone number is required");
        if (!amount || amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        const sender = yield user_model_1.User.findById(senderId).session(session);
        if (!sender)
            throw new AppError_1.default(404, "Sender not found");
        const receiver = yield user_model_1.User.findOne({ phone: receiverPhone }).session(session);
        if (!receiver)
            throw new AppError_1.default(404, "Receiver not found");
        if (String(sender._id) === String(receiver._id)) {
            throw new AppError_1.default(400, "Cannot send money to self");
        }
        const senderWallet = yield wallet_model_1.Wallet.findOne({ userId: sender._id }).session(session);
        const receiverWallet = yield wallet_model_1.Wallet.findOne({ userId: receiver._id }).session(session);
        if (!senderWallet || !receiverWallet)
            throw new AppError_1.default(404, "Wallet not found");
        const transactionFee = Number(env_1.envVars.TRANSACTION_FEE) || 0;
        const newFee = (transactionFee / 100) * amount;
        const totalDeduction = amount + newFee;
        if (senderWallet.balance < totalDeduction)
            throw new AppError_1.default(400, "Insufficient balance");
        senderWallet.balance -= totalDeduction;
        yield senderWallet.save({ session });
        receiverWallet.balance += amount;
        yield receiverWallet.save({ session });
        yield tx_model_1.default.create([
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
        ], { session, ordered: true });
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({
            success: true,
            message: `Money sent successfully to ${receiver.phone}`,
            senderWallet,
            receiverWallet,
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: error.message || "Send money failed",
            error,
        });
    }
});
exports.sendMoney = sendMoney;
const getTransactionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filters
        const type = req.query.type; // CASH_IN, CASH_OUT
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const wallet = yield wallet_model_1.Wallet.findOne({ userId });
        if (!wallet)
            throw new AppError_1.default(404, "Wallet not found");
        // Build query
        const query = {
            $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
        };
        if (type)
            query.type = type;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        // Fetch transactions
        const transactions = yield tx_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        // Total count
        const total = yield tx_model_1.default.countDocuments(query);
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
        (0, sendResponse_1.sendResponse)(res, response);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions",
            error,
        });
    }
});
exports.getTransactionHistory = getTransactionHistory;
const getWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const wallet = yield wallet_model_1.Wallet.findOne({ userId });
        if (!wallet) {
            return res.status(404).json({ success: false, message: "Wallet not found" });
        }
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: 200,
            message: "Wallet retrieved successfully",
            data: wallet,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to retrieve wallet" });
    }
});
exports.getWallet = getWallet;
