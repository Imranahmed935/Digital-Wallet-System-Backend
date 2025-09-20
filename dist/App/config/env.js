"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnv = () => {
    const requiredEnv = ["PORT", "FRONTEND_URL", "FRONTEND_URL_PROD", "DB_URL", "JWT_SECRET", "TRANSACTION_FEE", "JWT_EXPIRED", "JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRES", "SUPER_ADMIN_PASS", "SUPER_ADMIN_EMAIL", "BCRYPT_SALT_ROUND", "ADMIN_PHONE_NUMBER"];
    requiredEnv.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRED: process.env.JWT_EXPIRED,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
        SUPER_ADMIN_PASS: process.env.SUPER_ADMIN_PASS,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
        ADMIN_PHONE_NUMBER: process.env.ADMIN_PHONE_NUMBER,
        TRANSACTION_FEE: process.env.TRANSACTION_FEE,
        FRONTEND_URL: process.env.FRONTEND_URL,
        FRONTEND_URL_PROD: process.env.FRONTEND_URL_PROD,
    };
};
exports.envVars = loadEnv();
