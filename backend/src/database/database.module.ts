import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Admin } from "../auth/entities/admin.entity";
import { Vehicle } from "../vehicles/entities/vehicle.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get("NODE_ENV") === "production";
        const databaseUrl = configService.get<string>("DATABASE_URL");

        if (isProduction) {
          return {
            type: "postgres",
            url: databaseUrl,
            entities: [Admin, Vehicle],
            synchronize: true, // Auto-create schema in production for initial deployment
            logging: false,
          };
        }

        return {
          type: "mysql",
          host: configService.get<string>("DB_HOST", "mysql"), // 'mysql' because it is the docker service name
          port: configService.get<number>("DB_PORT", 3306),
          username: configService.get<string>("DB_USERNAME", "root"),
          password: configService.get<string>("DB_PASSWORD", "password"),
          database: configService.get<string>("DB_DATABASE", "vehicle_sales"),
          entities: [Admin, Vehicle],
          synchronize: true,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
