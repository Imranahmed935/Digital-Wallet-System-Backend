import { Router } from "express";
import {  blockWallet, getAllAgents, getAllTransactions, getAllUsers, getAllWallets, toggleUserBlock, updateAgentStatus } from "./admin.controller";
import { checkAuth } from "../../midleware/checkAuth";
import { Role } from "../user/user.interface";


const router = Router();

// View endpoints
router.get("/users", checkAuth(Role.ADMIN), getAllUsers);
router.get("/agents", checkAuth(Role.ADMIN), getAllAgents);
router.get("/wallets", checkAuth(Role.ADMIN), getAllWallets);
router.get("/transactions", checkAuth(Role.ADMIN), getAllTransactions);
router.post("/block/:id", checkAuth(Role.ADMIN), toggleUserBlock);

// Admin actions
router.post("/wallet/block",  blockWallet);      
router.post("/agent/status", updateAgentStatus); 

export const adminRouter= router;
