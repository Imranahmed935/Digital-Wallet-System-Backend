"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const checkAuth_1 = require("../../midleware/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
// View endpoints
router.get("/users", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), admin_controller_1.getAllUsers);
router.get("/agents", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), admin_controller_1.getAllAgents);
router.get("/wallets", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), admin_controller_1.getAllWallets);
router.get("/transactions", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), admin_controller_1.getAllTransactions);
// Admin actions
router.post("/wallet/block", admin_controller_1.blockWallet);
router.post("/agent/status", admin_controller_1.updateAgentStatus);
exports.adminRouter = router;
