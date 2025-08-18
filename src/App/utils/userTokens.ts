import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import AppError from "../errorHelpers/AppError";

export const createUserTokens = (user:Partial<IUser>)=>{
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };
    
      const accessToken = generateToken(jwtPayload, envVars.JWT_SECRET, envVars.JWT_EXPIRED);
      const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)
    return {
        accessToken,
        refreshToken
    }
}

export const createAccessTokenWithRefreshToken = async(refreshToken:string)=>{
const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload
  const existEmail = await User.findOne({ email:verifiedRefreshToken.email });
  if (!existEmail) {
    throw new AppError(403, "User does not Exist!");
  }

  const jwtPayload = {
    userId: existEmail._id,
    email: existEmail.email,
    role: existEmail.role,
  };

  const accessToken = generateToken(jwtPayload, envVars.JWT_SECRET, envVars.JWT_EXPIRED);
  return accessToken;
}