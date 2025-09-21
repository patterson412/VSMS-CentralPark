import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Admin } from "../auth/entities/admin.entity";
import { Vehicle } from "../vehicles/entities/vehicle.entity";

config();

export const AppDataSource = new DataSource({
  type: process.env.DATABASE_URL ? "postgres" : "mysql",
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : "127.0.0.1",
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DATABASE_URL ? undefined : (process.env.DB_USERNAME || "root"),
  password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || "password"),
  database: process.env.DATABASE_URL ? undefined : (process.env.DB_DATABASE || "vehicle_sales"),
  entities: [Admin, Vehicle],
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
