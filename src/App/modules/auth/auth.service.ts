import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const credentialLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required!");
  }

  const existUser = await User.findOne({ email });
  if (!existUser) {
    throw new AppError(400, "Email does not exist");
  }

  const comparedPass = await bcryptjs.compare(password, existUser.password as string);
  if (!comparedPass) {
    throw new AppError(400, "Incorrect password!");
  }

  const userTokens = createUserTokens(existUser);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password:ps, ...userWithoutPassword } = existUser.toObject();

  return {
    accessToken:userTokens.accessToken,
    refreshToken:userTokens.refreshToken,
    userWithoutPassword,
  };
};

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string)
    if (!isOldPasswordMatch) {
        throw new AppError(403, "Old Password does not match");
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

   await user!.save();


}

export const authService = {
  credentialLogin,
  changePassword
};
