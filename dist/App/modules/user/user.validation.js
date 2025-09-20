"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.UserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(2, { message: "Name too short, min 2 characters!" })
        .max(20, { message: "Name too big, max 20 characters!" }),
    email: zod_1.default.string().email({ message: "Invalid Email Address!" }),
    phone: zod_1.default.string().regex(/^01[0-9]{9}$/, {
        message: "Phone must be a valid Bangladeshi number (11 digits starting with 01)",
    }),
    password: zod_1.default
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/(?=.*[A-Z])/, {
        message: "Password must contain at least one uppercase letter",
    })
        .regex(/(?=.*[a-z])/, {
        message: "Password must contain at least one lowercase letter",
    })
        .regex(/(?=.*\d)/, { message: "Password must contain at least one number" })
        .regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
        message: "Password must contain at least one special character",
    }),
    role: zod_1.default
        .string()
        .transform((val) => val.toUpperCase())
        .refine((val) => Object.values(user_interface_1.Role).includes(val), {
        message: `Role must be one of: ${Object.values(user_interface_1.Role).join(", ")}`,
    }),
});
