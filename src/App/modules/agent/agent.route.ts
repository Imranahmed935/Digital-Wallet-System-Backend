import { Router } from "express";
import { cashIn, cashOut, getCommissionHistory } from "./agent.controller";


const router = Router();

router.post("/cash-in", cashIn);                 
router.post("/cash-out", cashOut);               
router.get("/commission/:agentId", getCommissionHistory); 

export const agentRouter= router;
