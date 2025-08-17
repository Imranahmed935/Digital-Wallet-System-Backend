import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";

 const credentialLogin = async (req: Request, res: Response) => {
  const loginInfo = await authService.credentialLogin(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "user loggedIn successfully",
    data: loginInfo,
  });
};

export const authController = {
    credentialLogin
}