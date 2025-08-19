import z from "zod";
import { Role } from "./user.interface";


export const UserZodSchema = z.object({
  name: z.string()
    .min(2, { message: "Name too short, min 2 characters!" })
    .max(20, { message: "Name too big, max 20 characters!" }),

  email: z.string().email({ message: "Invalid Email Address!" }),

  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/(?=.*[A-Z])/, { message: "Password must contain at least one uppercase letter" })
    .regex(/(?=.*[a-z])/, { message: "Password must contain at least one lowercase letter" })
    .regex(/(?=.*\d)/, { message: "Password must contain at least one number" })
    .regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, { message: "Password must contain at least one special character" }),

  role: z.string().transform(val => val.toUpperCase())
        .refine(val => Object.values(Role).includes(val as Role), {
          message: `Role must be one of: ${Object.values(Role).join(", ")}`,
        }),

});
