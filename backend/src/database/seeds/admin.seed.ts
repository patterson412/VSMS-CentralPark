import { AppDataSource } from "../data-source";
import { Admin } from "../../auth/entities/admin.entity";
import { AuthService } from "../../auth/auth.service";
import * as bcrypt from "bcrypt";

async function seedAdmin() {
  try {
    console.log("🌱 Starting admin seeding...");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const adminRepository = AppDataSource.getRepository(Admin);

    // Check if admin already exists
    const existingAdmin = await adminRepository.findOne({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin", 12);

    const admin = adminRepository.create({
      username: "admin",
      password: hashedPassword,
    });

    await adminRepository.save(admin);

    console.log("✅ Default admin user created successfully");
    console.log("   Username: admin");
    console.log("   Password: admin");
    console.log("   ID:", admin.id);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log("🎉 Admin seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Admin seeding failed:", error);
      process.exit(1);
    });
}

export { seedAdmin };
