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
exports.toggleAgentStatus = exports.toggleUserBlock = exports.blockWallet = exports.getAllTransactionsWithDaily = exports.getAllWallets = exports.getAllAgents = exports.getUsersWithDailyStats = void 0;
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const tx_model_1 = __importDefault(require("../transaction/tx.model"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const sendResponse_1 = require("../../utils/sendResponse");
const getUsersWithDailyStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const users = yield user_model_1.User.find({ role: "USER" });
        const match = { role: "USER" };
        if (startDate)
            match.createdAt = { $gte: new Date(startDate) };
        if (endDate)
            match.createdAt = Object.assign(Object.assign({}, match.createdAt), { $lte: new Date(endDate) });
        const dailyUsers = yield user_model_1.User.aggregate([
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users and daily stats",
            error,
        });
    }
});
exports.getUsersWithDailyStats = getUsersWithDailyStats;
const getAllAgents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agents = yield user_model_1.User.find({ role: "AGENT" });
        const dailyAgents = yield user_model_1.User.aggregate([
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
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: 200,
            message: "Agents retrieved successfully",
            data: {
                agents,
                dailyAgents,
            },
        });
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
const getAllWallets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallets = yield wallet_model_1.Wallet.find();
        res.status(200).json({ success: true, wallets });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch wallets", error });
    }
});
exports.getAllWallets = getAllWallets;
const getAllTransactionsWithDaily = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, status, category, minAmount, maxAmount, search, startDate, endDate, } = req.query;
        const query = {};
        // Filters
        if (status && String(status).trim() !== "") {
            query.status = status.toUpperCase();
        }
        if (category && String(category).trim() !== "") {
            query.type = category.toUpperCase();
        }
        if (minAmount && !isNaN(Number(minAmount))) {
            query.amount = Object.assign(Object.assign({}, query.amount), { $gte: Number(minAmount) });
        }
        if (maxAmount && !isNaN(Number(maxAmount))) {
            query.amount = Object.assign(Object.assign({}, query.amount), { $lte: Number(maxAmount) });
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
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
        const transactions = yield tx_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = yield tx_model_1.default.countDocuments(query);
        const meta = {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
        };
        // Daily aggregation
        const dailyTransactions = yield tx_model_1.default.aggregate([
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
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: 200,
            message: "Transactions retrieved successfully",
            data: {
                transactions,
                dailyTransactions,
            },
            meta
        });
    }
    catch (error) {
        (0, sendResponse_1.sendResponse)(res, {
            success: false,
            statusCode: 500,
            message: "Failed to fetch transactions",
            data: {
                transactions: [],
                dailyTransactions: [],
            },
        });
    }
});
exports.getAllTransactionsWithDaily = getAllTransactionsWithDaily;
const blockWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletId, block } = req.body;
        const wallet = yield wallet_model_1.Wallet.findById(walletId);
        if (!wallet)
            throw new AppError_1.default(404, "Wallet not found");
        wallet.isBlocked = block;
        yield wallet.save();
        res.status(200).json({
            success: true,
            message: `Wallet ${block ? "blocked" : "unblocked"}`,
            wallet,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update wallet status",
            error,
        });
    }
});
exports.blockWallet = blockWallet;
const toggleUserBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        if (!userId) {
            throw new AppError_1.default(400, "userId is required");
        }
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            throw new AppError_1.default(404, "User not found");
        }
        // Toggle the status
        user.isActive = !user.isActive;
        yield user.save();
        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? "unblocked" : "blocked"} successfully`,
            user,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update user status",
        });
    }
});
exports.toggleUserBlock = toggleUserBlock;
const toggleAgentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const agentId = (_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!agentId) {
            throw new AppError_1.default(400, "agentId is required");
        }
        const agent = yield user_model_1.User.findById(agentId);
        if (!agent) {
            throw new AppError_1.default(404, "Agent not found");
        }
        agent.isActive = !agent.isActive;
        yield agent.save();
        res.status(200).json({
            success: true,
            message: `Agent ${agent.isActive ? "approved" : "suspended"} successfully`,
            agent,
        });
    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update agent status",
        });
    }
});
exports.toggleAgentStatus = toggleAgentStatus;
