import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookies";
import { JwtPayload } from "jsonwebtoken";

const credentialLogin = async (req: Request, res: Response) => {
  const loginInfo = await authService.credentialLogin(req.body);
  const { accessToken, refreshToken } = loginInfo;

  setAuthCookie(res, { accessToken, refreshToken });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "user loggedIn successfully",
    data: loginInfo,
  });
};
const logOut = 
  async (req: Request, res: Response) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "user logged out successfully",
      data: null,
    });
  }
;


const changePassword = async (req: Request, res: Response) => {

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user

    await authService.changePassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Password Changed Successfully",
        data: null,
    })
}


export const authController = {
  credentialLogin,
  logOut,
  changePassword
};
