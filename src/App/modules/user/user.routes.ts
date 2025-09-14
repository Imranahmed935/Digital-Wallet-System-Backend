import { Router } from "express";
import { userControllers } from "./user.controller";
import { requestValidate } from "../../midleware/requestValidate";
import { UserZodSchema } from "./user.validation";
import { checkAuth } from "../../midleware/checkAuth";
import { Role } from "./user.interface";


const router = Router();

router.post(
  "/register",
  requestValidate(UserZodSchema),
  userControllers.createUser
);

router.get("/me", checkAuth(...Object.values(Role)), userControllers.getMe)
router.patch("/profile",checkAuth(...Object.values(Role)), userControllers.updateUserProfile)

export const userRouter = router;
