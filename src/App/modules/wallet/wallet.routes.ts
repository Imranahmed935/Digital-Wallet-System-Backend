import { Router } from "express";
import { addMoney, getTransactionHistory, getWallet, sendMoney, withdrawMoney } from "./wallet.controller";
import { checkAuth } from "../../midleware/checkAuth";
import { Role } from "../user/user.interface";


const router = Router();

router.post("/add", checkAuth(...Object.values(Role)),addMoney);            
router.post("/withdraw",checkAuth(...Object.values(Role)), withdrawMoney);    
router.post("/send",checkAuth(...Object.values(Role)), sendMoney);            
router.get(
  "/transactions/me",
  checkAuth(...Object.values(Role)),
  getTransactionHistory
);

router.get("/wallet", checkAuth(...Object.values(Role)), getWallet)

export const walletRouter = router;
