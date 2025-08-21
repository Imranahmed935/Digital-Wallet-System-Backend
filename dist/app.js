"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = require("./App/modules/user/user.routes");
const auth_routes_1 = require("./App/modules/auth/auth.routes");
const notFound_1 = __importDefault(require("./App/midleware/notFound"));
const wallet_routes_1 = require("./App/modules/wallet/wallet.routes");
const agent_route_1 = require("./App/modules/agent/agent.route");
const admin_route_1 = require("./App/modules/admin/admin.route");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1", user_routes_1.userRouter);
app.use("/api/v1", auth_routes_1.authRouter);
app.use("/api/v1", wallet_routes_1.walletRouter);
app.use("/api/v1", agent_route_1.agentRouter);
app.use("/api/v1", admin_route_1.adminRouter);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Digital Wallet Server is Running!!!",
    });
});
app.use(notFound_1.default);
exports.default = app;
