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
exports.seedSuperAdmin = void 0;
const env_1 = require("../config/env");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const wallet_model_1 = require("../modules/wallet/wallet.model");
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Check if super admin already exists
        const isSuperAdminExist = yield user_model_1.User.findOne({
            email: env_1.envVars.SUPER_ADMIN_EMAIL,
        });
        if (isSuperAdminExist) {
            console.log("Super admin already exists!");
            return;
        }
        // 2. Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(env_1.envVars.SUPER_ADMIN_PASS, Number(env_1.envVars.BCRYPT_SALT_ROUND));
        // 3. Create super admin user
        const payload = {
            name: "Admin",
            email: env_1.envVars.SUPER_ADMIN_EMAIL,
            role: user_interface_1.Role.ADMIN,
            password: hashedPassword,
            phone: env_1.envVars.ADMIN_PHONE_NUMBER || "01700000000",
        };
        const admin = yield user_model_1.User.create(payload);
        console.log("✅ Super Admin created successfully:", admin.email);
        // 4. Create wallet automatically for admin
        const wallet = yield wallet_model_1.Wallet.create({
            user: admin._id,
            balance: 1000000,
            status: "active",
        });
        console.log("✅ Wallet created for Super Admin:", wallet._id);
    }
    catch (error) {
        console.log("❌ Error seeding Super Admin:", error);
    }
});
exports.seedSuperAdmin = seedSuperAdmin;
