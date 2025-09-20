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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const sendResponse_1 = require("../../utils/sendResponse");
const setCookies_1 = require("../../utils/setCookies");
const credentialLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInfo = yield auth_service_1.authService.credentialLogin(req.body);
    const { accessToken, refreshToken } = loginInfo;
    (0, setCookies_1.setAuthCookie)(res, { accessToken, refreshToken });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "user loggedIn successfully",
        data: loginInfo,
    });
});
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "user logged out successfully",
        data: null,
    });
});
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;
    yield auth_service_1.authService.changePassword(oldPassword, newPassword, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Password Changed Successfully",
        data: null,
    });
});
exports.authController = {
    credentialLogin,
    logOut,
    changePassword
};
