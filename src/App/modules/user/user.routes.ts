import { Router } from "express";
import { userControllers } from "./user.controller";
import { requestValidate } from "../../midleware/requestValidate";
import { UserZodSchema } from "./user.validation";

const router = Router();

router.post(
  "/register",
  requestValidate(UserZodSchema),
  userControllers.createUser
);

export const userRouter = router;
