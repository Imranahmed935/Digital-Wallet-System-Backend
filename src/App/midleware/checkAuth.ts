import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization || req.cookies.accessToken;
      if (!authHeader) {
        throw new AppError(403, "No token provided");
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      const verifiedToken = verifyToken(token, envVars.JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      const existUser = await User.findById(verifiedToken.userId);
      if (!existUser) {
        throw new AppError(404, "User does not exist!");
      }

      req.user = verifiedToken;

      if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
