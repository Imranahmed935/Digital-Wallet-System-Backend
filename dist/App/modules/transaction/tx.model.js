"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const txSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["DEPOSIT", "WITHDRAW", "TRANSFER", "CASH_IN", "CASH_OUT"],
        required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    fee: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    fromWallet: { type: mongoose_1.Schema.Types.ObjectId, ref: "Wallet" },
    toWallet: { type: mongoose_1.Schema.Types.ObjectId, ref: "Wallet" },
    initiatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "REVERSED", "FAILED"],
        default: "COMPLETED",
    },
    meta: { type: Object },
}, { timestamps: true });
const Transaction = (0, mongoose_1.model)("Transaction", txSchema);
exports.default = Transaction;
