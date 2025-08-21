"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const mongoose_1 = require("mongoose");
const agentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    commissionRate: { type: Number, default: 2 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Agent = (0, mongoose_1.model)("Agent", agentSchema);
