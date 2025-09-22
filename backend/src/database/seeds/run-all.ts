import { AppDataSource } from "../data-source";
import { Admin } from "../../auth/entities/admin.entity";
import { Vehicle } from "../../vehicles/entities/vehicle.entity";
import { seedAdmin } from "./admin.seed";
import { seedVehicles } from "./vehicles.seed";

async function runAllSeeds() {
  try {
    console.log("🌱 Starting comprehensive database seeding (with data reset)...\n");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const adminRepository = AppDataSource.getRepository(Admin);
    const vehicleRepository = AppDataSource.getRepository(Vehicle);

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await vehicleRepository.clear();
    await adminRepository.clear();
    console.log("   ✅ Database cleared\n");

    // Seed admin first
    await seedAdmin();
    console.log("");

    // Then seed vehicles
    await seedVehicles();
    console.log("");

    console.log("🎉 All seeding operations completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   ✅ Admin user: username=admin, password=admin");
    console.log("   ✅ Sample vehicles with diverse types and data");
    console.log("   🔗 API available at http://localhost:3001");
    console.log("   📚 Documentation at http://localhost:3001/api");
  } catch (error) {
    console.error("❌ Seeding operation failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAllSeeds()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ All seeds failed:", error);
      process.exit(1);
    });
}

export { runAllSeeds };
