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
const env_1 = require("./App/config/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.set("trust proxy", 1);
app.use(express_1.default.urlencoded({ extended: true }));
const allowedOrigins = [
    env_1.envVars.FRONTEND_URL,
    env_1.envVars.FRONTEND_URL_PROD
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
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
