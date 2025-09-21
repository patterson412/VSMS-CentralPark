import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VehiclesService } from "./vehicles.service";
import { VehiclesController } from "./vehicles.controller";
import { Vehicle } from "./entities/vehicle.entity";
import { OpenaiModule } from "../openai/openai.module";
import { AwsModule } from "../aws/aws.module";

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle]), OpenaiModule, AwsModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
