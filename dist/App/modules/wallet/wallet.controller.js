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
exports.getTransactionHistory = exports.sendMoney = exports.withdrawMoney = exports.addMoney = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tx_model_1 = __importDefault(require("../transaction/tx.model"));
const wallet_model_1 = require("./wallet.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const env_1 = require("../../config/env");
const addMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userId, amount } = req.body;
        if (amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        const wallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
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
                initiatedBy: userId,
                status: "COMPLETED",
                meta: { description: "Top-up added" },
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
        const { userId, amount } = req.body;
        if (amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        const wallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
        if (!wallet)
            throw new AppError_1.default(404, "Wallet not found");
        if (wallet.balance < amount)
            throw new AppError_1.default(400, "Insufficient balance");
        const transactionFee = Number(env_1.envVars.TRANSACTION_FEE);
        const newFee = (transactionFee / 100) * amount;
        wallet.balance -= (amount + newFee);
        yield wallet.save({ session });
        yield tx_model_1.default.create([
            {
                type: "WITHDRAW",
                amount,
                fee: newFee,
                commission: 0,
                fromWallet: wallet._id,
                initiatedBy: userId,
                status: "COMPLETED",
                meta: { description: "Money withdrawn" },
            },
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: "Money withdrawn successfully", wallet });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: "Withdraw failed", error });
    }
});
exports.withdrawMoney = withdrawMoney;
const sendMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { senderId, receiverId, amount } = req.body;
        if (amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        if (senderId === receiverId)
            throw new AppError_1.default(400, "Cannot send money to self");
        const senderWallet = yield wallet_model_1.Wallet.findOne({ userId: senderId }).session(session);
        const receiverWallet = yield wallet_model_1.Wallet.findOne({ userId: receiverId }).session(session);
        if (!senderWallet || !receiverWallet)
            throw new AppError_1.default(404, "Wallet not found");
        if (senderWallet.balance < amount)
            throw new AppError_1.default(400, "Insufficient balance");
        const transactionFee = Number(env_1.envVars.TRANSACTION_FEE);
        const newFee = (transactionFee / 100) * amount;
        senderWallet.balance -= (amount + newFee);
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
                initiatedBy: senderId,
                status: "COMPLETED",
                meta: { description: "Money sent to another user" },
            },
            {
                type: "CASH_IN",
                amount,
                fee: 0,
                commission: 0,
                fromWallet: senderWallet._id,
                toWallet: receiverWallet._id,
                initiatedBy: receiverId,
                status: "COMPLETED",
                meta: { description: "Money received from another user" },
            },
        ], { session, ordered: true });
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: "Money sent successfully", senderWallet, receiverWallet });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: "Send money failed", error });
    }
});
exports.sendMoney = sendMoney;
// View Transaction History
const getTransactionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const wallet = yield wallet_model_1.Wallet.findOne({ userId });
        if (!wallet)
            throw new AppError_1.default(404, "Wallet not found");
        const transactions = yield tx_model_1.default.find({
            $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch transactions", error });
    }
});
exports.getTransactionHistory = getTransactionHistory;
