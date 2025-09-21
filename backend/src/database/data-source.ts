import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Admin } from "../auth/entities/admin.entity";
import { Vehicle } from "../vehicles/entities/vehicle.entity";

config();

const isProduction = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource(
  isProduction
    ? {
        type: "postgres",
        url: databaseUrl,
        entities: [Admin, Vehicle],
        synchronize: true,
        logging: false,
      }
    : {
        type: "mysql",
        host: process.env.DB_HOST || "mysql",
        port: parseInt(process.env.DB_PORT || "3306"),
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_DATABASE || "vehicle_sales",
        entities: [Admin, Vehicle],
        synchronize: true,
        logging: true,
      }
);
