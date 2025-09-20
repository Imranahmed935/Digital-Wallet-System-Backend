import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../midleware/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/login", authController.credentialLogin)
router.post("/logout", authController.logOut)
router.post("/change-password", checkAuth(...Object.values(Role)), authController.changePassword)

export const authRouter = router