import { envVars } from "../config/env";
import { IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

import bcryptjs from "bcryptjs";
import { Wallet } from "../modules/wallet/wallet.model";

export const seedSuperAdmin = async () => {
  try {
    // 1. Check if super admin already exists
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log("Super admin already exists!");
      return;
    }

    // 2. Hash password
    const hashedPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASS,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    // 3. Create super admin user
    const payload: IUser = {
      name: "Admin",
      email: envVars.SUPER_ADMIN_EMAIL,
      role: Role.ADMIN,
      password: hashedPassword,
      phone: envVars.ADMIN_PHONE_NUMBER || "01700000000", 
    };

    const admin = await User.create(payload);
    console.log("✅ Super Admin created successfully:", admin.email);

    // 4. Create wallet automatically for admin
    const wallet = await Wallet.create({
      user: admin._id,  
      balance: 1000000,       
      status: "active", 
    });

    console.log("✅ Wallet created for Super Admin:", wallet._id);

  } catch (error) {
    console.log("❌ Error seeding Super Admin:", error);
  }
};
