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
exports.getCommissionHistory = exports.cashOut = exports.cashIn = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const wallet_model_1 = require("../wallet/wallet.model");
const tx_model_1 = __importDefault(require("../transaction/tx.model"));
const cashIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { agentId, userId, amount } = req.body;
        if (amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        const wallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
        if (!wallet)
            throw new AppError_1.default(404, "User wallet not found");
        wallet.balance += amount;
        yield wallet.save({ session });
        yield tx_model_1.default.create([
            {
                type: "CASH_IN",
                amount,
                fee: 0,
                commission: 0,
                toWallet: wallet._id,
                initiatedBy: agentId,
                status: "COMPLETED",
                meta: { description: "Cash-in by agent" },
            },
        ], { session, ordered: true });
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: "Cash-in successful", wallet });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: "Cash-in failed", error });
    }
});
exports.cashIn = cashIn;
const cashOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { agentId, userId, amount } = req.body;
        if (amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        const wallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
        if (!wallet)
            throw new AppError_1.default(404, "User wallet not found");
        if (wallet.balance < amount)
            throw new AppError_1.default(400, "Insufficient balance");
        wallet.balance -= amount;
        yield wallet.save({ session });
        yield tx_model_1.default.create([
            {
                type: "CASH_OUT",
                amount,
                fee: 0,
                commission: 0,
                fromWallet: wallet._id,
                initiatedBy: agentId,
                status: "COMPLETED",
                meta: { description: "Cash-out by agent" },
            },
        ], { session, ordered: true });
        yield session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: "Cash-out successful", wallet });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: "Cash-out failed", error });
    }
});
exports.cashOut = cashOut;
const getCommissionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { agentId } = req.params;
        const transactions = yield tx_model_1.default.find({ initiatedBy: agentId, type: { $in: ["CASH_IN", "CASH_OUT"] } })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, transactions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch commission history", error });
    }
});
exports.getCommissionHistory = getCommissionHistory;
