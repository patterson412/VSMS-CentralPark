import { AppDataSource } from "../data-source";
import { Vehicle } from "../../vehicles/entities/vehicle.entity";

async function seedVehicles() {
  try {
    console.log("🌱 Starting vehicles seeding...");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const vehicleRepository = AppDataSource.getRepository(Vehicle);

    // Check if vehicles already exist
    const existingVehicles = await vehicleRepository.count();

    if (existingVehicles > 0) {
      console.log(`✅ ${existingVehicles} vehicles already exist in database`);
      return;
    }

    // Sample vehicle data
    const sampleVehicles = [
      {
        type: "Car",
        brand: "Toyota",
        model: "Camry",
        color: "Silver",
        engineSize: "2.5L",
        year: 2023,
        price: 28500.0,
        description:
          "Experience the perfect blend of reliability and performance with this stunning 2023 Toyota Camry. This silver beauty features a 2.5L engine that delivers both power and efficiency. Whether you're commuting to work or embarking on weekend adventures, this car offers the comfort and dependability you deserve.",
        images: [],
      },
      {
        type: "SUV",
        brand: "Honda",
        model: "CR-V",
        color: "Blue",
        engineSize: "1.5L Turbo",
        year: 2024,
        price: 32400.0,
        description:
          "Discover your next adventure with this exceptional 2024 Honda CR-V. This blue SUV is powered by a 1.5L Turbo engine, offering the perfect balance of performance and fuel economy. From its eye-catching exterior to its comfortable interior, every detail has been designed with you in mind.",
        images: [],
      },
      {
        type: "Bike",
        brand: "Yamaha",
        model: "MT-07",
        color: "Black",
        engineSize: "689cc",
        year: 2023,
        price: 7699.0,
        description:
          "Step into excitement with this magnificent 2023 Yamaha MT-07. The black finish catches the eye, while the 689cc engine delivers impressive power when you need it most. This bike combines modern technology with time-tested reliability, making it perfect for both daily rides and weekend adventures.",
        images: [],
      },
      {
        type: "Truck",
        brand: "Ford",
        model: "F-150",
        color: "Red",
        engineSize: "3.5L V6",
        year: 2023,
        price: 42650.0,
        description:
          "Unleash your potential with this powerful 2023 Ford F-150. This red truck features a robust 3.5L V6 engine designed for both work and play. With its rugged construction and advanced features, this F-150 is ready to tackle any challenge you throw at it.",
        images: [],
      },
      {
        type: "Car",
        brand: "BMW",
        model: "3 Series",
        color: "White",
        engineSize: "2.0L Turbo",
        year: 2024,
        price: 45200.0,
        description:
          "Experience luxury and performance with this stunning 2024 BMW 3 Series. This white sedan combines elegant design with a powerful 2.0L Turbo engine. Every drive becomes an experience with BMW's renowned engineering and premium craftsmanship.",
        images: [],
      },
      {
        type: "SUV",
        brand: "Mazda",
        model: "CX-5",
        color: "Gray",
        engineSize: "2.5L",
        year: 2023,
        price: 29200.0,
        description:
          "Discover sophistication with this beautiful 2023 Mazda CX-5. This gray SUV features a refined 2.5L engine and Mazda's signature design philosophy. Perfect for families who demand both style and substance in their daily drive.",
        images: [],
      },
      {
        type: "Van",
        brand: "Mercedes-Benz",
        model: "Sprinter",
        color: "White",
        engineSize: "2.0L Turbo Diesel",
        year: 2023,
        price: 52500.0,
        description:
          "Experience commercial excellence with this 2023 Mercedes-Benz Sprinter. This white van features a reliable 2.0L Turbo Diesel engine, perfect for business operations or large family transportation needs. Built with Mercedes-Benz quality and engineering.",
        images: [],
      },
      {
        type: "Car",
        brand: "Tesla",
        model: "Model 3",
        color: "Black",
        engineSize: "Electric",
        year: 2024,
        price: 47240.0,
        description:
          "Step into the future with this cutting-edge 2024 Tesla Model 3. This black electric vehicle represents the pinnacle of sustainable transportation, offering incredible performance, advanced autopilot features, and zero emissions driving.",
        images: [],
      },
    ];

    // Create and save vehicles
    const vehicles = vehicleRepository.create(sampleVehicles);
    await vehicleRepository.save(vehicles);

    console.log(`✅ Successfully seeded ${vehicles.length} sample vehicles`);
    console.log(
      "   Vehicle types:",
      [...new Set(vehicles.map((v) => v.type))].join(", "),
    );
    console.log(
      "   Price range: $",
      Math.min(...vehicles.map((v) => Number(v.price))),
      "- $",
      Math.max(...vehicles.map((v) => Number(v.price))),
    );
  } catch (error) {
    console.error("❌ Error seeding vehicles:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedVehicles()
    .then(() => {
      console.log("🎉 Vehicles seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Vehicles seeding failed:", error);
      process.exit(1);
    });
}

export { seedVehicles };
