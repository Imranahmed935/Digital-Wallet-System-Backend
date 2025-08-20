import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";

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

export const authService = {
  credentialLogin,
};
