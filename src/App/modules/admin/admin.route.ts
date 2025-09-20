import { Router } from "express";
import {  blockWallet, getAllAgents,  getAllTransactionsWithDaily,   getAllWallets, getUsersWithDailyStats, toggleAgentStatus, toggleUserBlock } from "./admin.controller";
import { checkAuth } from "../../midleware/checkAuth";
import { Role } from "../user/user.interface";


const router = Router();

// View endpoints
router.get("/users", checkAuth(Role.ADMIN), getUsersWithDailyStats);
router.get("/agents", checkAuth(Role.ADMIN), getAllAgents);
router.get("/wallets", checkAuth(Role.ADMIN), getAllWallets);
router.get("/transactions", checkAuth(Role.ADMIN), getAllTransactionsWithDaily);
router.post("/block/:id", checkAuth(Role.ADMIN), toggleUserBlock);

// Admin actions
router.post("/wallet/block", checkAuth(Role.ADMIN), blockWallet);      
router.post("/agent/status/:id",checkAuth(Role.ADMIN), toggleAgentStatus); 

export const adminRouter= router;
