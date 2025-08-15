import z from "zod";

export const UserZodSchema = z.object({
    name:z.string().min(2, {message:"name to short, min 2 character!"}).max(20, {message:"name to big, max 20 character!"}),
    email:z.string().email({message:"Invalid Email Address!!"}),
    password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/(?=.*[A-Z])/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
      message: "Password must contain at least one special character",
    }),
})