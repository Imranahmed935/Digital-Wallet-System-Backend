import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";




export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new AppError(403, "No token provided");
      }

      const verifiedToken = verifyToken(token, envVars.JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      const existUser = await User.findById(verifiedToken.id);
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
