import { Router } from "express";
import { addMoney, getTransactionHistory, sendMoney, withdrawMoney } from "./wallet.controller";


const router = Router();

router.post("/add", addMoney);            
router.post("/withdraw", withdrawMoney);    
router.post("/send", sendMoney);            
router.get("/transactions/:userId", getTransactionHistory); 

export const walletRouter = router;
