"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessTokenWithRefreshToken = exports.createUserTokens = void 0;
const env_1 = require("../config/env");
const user_model_1 = require("../modules/user/user.model");
const jwt_1 = require("./jwt");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const createUserTokens = (user) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, env_1.envVars.JWT_SECRET, env_1.envVars.JWT_EXPIRED);
    const refreshToken = (0, jwt_1.generateToken)(jwtPayload, env_1.envVars.JWT_REFRESH_SECRET, env_1.envVars.JWT_REFRESH_EXPIRES);
    return {
        accessToken,
        refreshToken
    };
};
exports.createUserTokens = createUserTokens;
const createAccessTokenWithRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedRefreshToken = (0, jwt_1.verifyToken)(refreshToken, env_1.envVars.JWT_REFRESH_SECRET);
    const existEmail = yield user_model_1.User.findOne({ email: verifiedRefreshToken.email });
    if (!existEmail) {
        throw new AppError_1.default(403, "User does not Exist!");
    }
    const jwtPayload = {
        userId: existEmail._id,
        email: existEmail.email,
        role: existEmail.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, env_1.envVars.JWT_SECRET, env_1.envVars.JWT_EXPIRED);
    return accessToken;
});
exports.createAccessTokenWithRefreshToken = createAccessTokenWithRefreshToken;
