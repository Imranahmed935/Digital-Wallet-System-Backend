import dotenv from "dotenv";
import { string } from "zod";

dotenv.config();

export interface EnvConfig {
  PORT: string;
  DB_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRED: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  SUPER_ADMIN_EMAIL:string;
  SUPER_ADMIN_PASS:string;
  BCRYPT_SALT_ROUND:string;
  ADMIN_PHONE_NUMBER:string;
}

const loadEnv = (): EnvConfig => {
  const requiredEnv: string[] = ["PORT", "DB_URL", "JWT_SECRET", "JWT_EXPIRED","JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRES","SUPER_ADMIN_PASS", "SUPER_ADMIN_EMAIL","BCRYPT_SALT_ROUND","ADMIN_PHONE_NUMBER"];
  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing require environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRED: process.env.JWT_EXPIRED!,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET!,
    JWT_REFRESH_EXPIRES:process.env.JWT_REFRESH_EXPIRES!,
    SUPER_ADMIN_PASS:process.env.SUPER_ADMIN_PASS!,
    SUPER_ADMIN_EMAIL:process.env.SUPER_ADMIN_EMAIL!,
    BCRYPT_SALT_ROUND:process.env.BCRYPT_SALT_ROUND!,
    ADMIN_PHONE_NUMBER:process.env.ADMIN_PHONE_NUMBER!,
  };
};

export const envVars = loadEnv();
