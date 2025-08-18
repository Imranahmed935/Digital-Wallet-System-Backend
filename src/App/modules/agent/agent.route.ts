import { Router } from "express";
import { cashIn, cashOut, getCommissionHistory } from "./agent.controller";
import { checkAuth } from "../../midleware/checkAuth";
import { Role } from "../user/user.interface";


const router = Router();

router.post("/cash-in", checkAuth(Role.AGENT), cashIn);                 
router.post("/cash-out",checkAuth(Role.AGENT), cashOut);               
router.get("/commission/:agentId", checkAuth(Role.AGENT), getCommissionHistory); 

export const agentRouter= router;
