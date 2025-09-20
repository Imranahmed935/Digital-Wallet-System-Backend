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
const user_model_1 = require("../user/user.model");
const sendResponse_1 = require("../../utils/sendResponse");
const cashIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { receiverPhone, amount } = req.body;
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!receiverPhone)
            throw new AppError_1.default(400, "Receiver phone number is required");
        if (amount <= 0)
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
        const senderWallet = yield wallet_model_1.Wallet.findOne({ agentId: sender._id }).session(session);
        const receiverWallet = yield wallet_model_1.Wallet.findOne({ userId: receiver._id }).session(session);
        if (!senderWallet || !receiverWallet)
            throw new AppError_1.default(404, "Wallet not found");
        const feeRate = 0.02;
        const commissionRate = 0.01;
        const fee = amount * feeRate;
        const commission = amount * commissionRate;
        const totalDeduct = amount + fee;
        if (senderWallet.balance < totalDeduct) {
            throw new AppError_1.default(400, "Insufficient balance (amount + fee required)");
        }
        senderWallet.balance -= totalDeduct;
        yield senderWallet.save({ session });
        receiverWallet.balance += amount;
        yield receiverWallet.save({ session });
        senderWallet.balance += commission;
        yield senderWallet.save({ session });
        yield tx_model_1.default.create([
            {
                type: "CASH_IN",
                amount,
                fee,
                commission,
                fromWallet: senderWallet._id,
                toWallet: receiverWallet._id,
                initiatedBy: sender._id,
                status: "COMPLETED",
                meta: { description: "Cash-in by agent" },
            },
        ], { session, ordered: true });
        yield session.commitTransaction();
        session.endSession();
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 200,
            success: true,
            message: "Cash-in successful",
            data: {
                senderWalletBalance: senderWallet.balance,
                receiverWalletBalance: receiverWallet.balance,
                fee,
                commission,
            },
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 500,
            success: false,
            message: "Cash-in failed",
            data: error.message,
        });
    }
});
exports.cashIn = cashIn;
const cashOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userPhone, amount } = req.body;
        const agentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userPhone)
            throw new AppError_1.default(400, "User phone number is required");
        if (amount <= 0)
            throw new AppError_1.default(400, "Amount must be greater than 0");
        const feeRate = 0.02;
        const commissionRate = 0.01;
        const fee = amount * feeRate;
        const commission = amount * commissionRate;
        const agent = yield user_model_1.User.findById(agentId).session(session);
        if (!agent)
            throw new AppError_1.default(404, "Agent not found");
        const userData = yield user_model_1.User.findOne({ phone: userPhone }).session(session);
        if (!userData)
            throw new AppError_1.default(404, "User not found");
        const agentWallet = yield wallet_model_1.Wallet.findOne({ agentId: agent._id }).session(session);
        if (!agentWallet)
            throw new AppError_1.default(404, "Agent wallet not found");
        const userWallet = yield wallet_model_1.Wallet.findOne({ userId: userData._id }).session(session);
        if (!userWallet)
            throw new AppError_1.default(404, "User wallet not found");
        const totalDeduction = amount + fee;
        if (userWallet.balance < totalDeduction)
            throw new AppError_1.default(400, `Insufficient user balance (need at least ৳${totalDeduction})`);
        userWallet.balance -= totalDeduction;
        yield userWallet.save({ session });
        agentWallet.balance += amount + commission;
        yield agentWallet.save({ session });
        yield tx_model_1.default.create([
            {
                type: "CASH_OUT",
                amount,
                fee,
                commission,
                fromWallet: userWallet._id,
                toWallet: agentWallet._id,
                initiatedBy: agentId,
                status: "COMPLETED",
                meta: {
                    description: `Cash-out ৳${amount} (+৳${fee} fee, ৳${commission} commission) by agent ${agent.phone}`,
                },
            },
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 200,
            success: true,
            message: "Cash-out successful",
            data: {
                agent: {
                    id: agent._id,
                    phone: agent.phone,
                    walletBalance: agentWallet.balance,
                },
                user: {
                    id: userData._id,
                    phone: userData.phone,
                    walletBalance: userWallet.balance,
                },
                transaction: {
                    amount,
                    fee,
                    commission,
                },
            },
        });
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 500,
            success: false,
            message: "Cash-out failed",
            data: error.message,
        });
    }
});
exports.cashOut = cashOut;
const getCommissionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { agentId } = req.params;
        const { page = 1, limit = 10, search = "", status, type } = req.query;
        const query = {
            initiatedBy: agentId,
            type: { $in: ["CASH_IN", "CASH_OUT"] },
        };
        if (search) {
            query.$or = [
                { type: { $regex: search, $options: "i" } },
                { status: { $regex: search, $options: "i" } },
            ];
        }
        if (status)
            query.status = status;
        if (type)
            query.type = type;
        const skip = (Number(page) - 1) * Number(limit);
        const [transactions, total] = yield Promise.all([
            tx_model_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            tx_model_1.default.countDocuments(query),
        ]);
        const totalTransactions = yield tx_model_1.default.countDocuments({ initiatedBy: agentId });
        res.status(200).json({
            success: true,
            message: "Transactions retrieved successfully",
            data: transactions,
            totalTransactions,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch commission history",
            error,
        });
    }
});
exports.getCommissionHistory = getCommissionHistory;
