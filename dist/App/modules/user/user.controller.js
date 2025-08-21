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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const tx_model_1 = __importDefault(require("../transaction/tx.model"));
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { name, email, password, role } = req.body;
        const normalizedRole = role === null || role === void 0 ? void 0 : role.toUpperCase();
        if (normalizedRole === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(403, "Admin registration not allowed!");
        }
        const existUser = yield user_model_1.User.findOne({ email });
        if (existUser)
            throw new AppError_1.default(400, "User already exists!");
        const hashedPass = yield bcryptjs_1.default.hash(password, 10);
        const newUserArray = yield user_model_1.User.create([{ name, email, password: hashedPass, role: normalizedRole }], { session });
        const newUser = newUserArray[0].toObject();
        // Wallet payload
        let walletPayload;
        if (normalizedRole === user_interface_1.Role.USER) {
            walletPayload = { userId: newUser._id, balance: 50 };
        }
        else if (normalizedRole === user_interface_1.Role.AGENT) {
            walletPayload = { agentId: newUser._id, balance: 50 };
        }
        else {
            throw new AppError_1.default(400, "Invalid role");
        }
        const newWallet = yield wallet_model_1.Wallet.create([walletPayload], { session });
        yield tx_model_1.default.create([
            {
                type: "DEPOSIT",
                amount: 50,
                fee: 0,
                commission: 0,
                toWallet: newWallet[0]._id,
                initiatedBy: newUser._id,
                status: "COMPLETED",
                meta: {
                    description: "Signup bonus credited automatically",
                    source: "SYSTEM",
                },
            },
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        res.status(201).json({
            success: true,
            message: `${normalizedRole} registered successfully with wallet!`,
            data: {
                user: userWithoutPassword,
                wallet: newWallet[0],
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: "Failed to create user/agent & wallet",
            error: error.message || error,
        });
    }
});
exports.userControllers = { createUser };
