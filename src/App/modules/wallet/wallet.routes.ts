import { Router } from "express";
import { addMoney, getTransactionHistory, getWallet, sendMoney, withdrawMoney } from "./wallet.controller";
import { checkAuth } from "../../midleware/checkAuth";
import { Role } from "../user/user.interface";


const router = Router();

router.post("/add", addMoney);            
router.post("/withdraw", withdrawMoney);    
router.post("/send", sendMoney);            
router.get("/transactions/:userId", getTransactionHistory); 
router.get("/wallet", checkAuth(...Object.values(Role)), getWallet)

export const walletRouter = router;
