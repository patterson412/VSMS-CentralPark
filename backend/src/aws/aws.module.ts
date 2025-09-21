import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AwsService } from "./aws.service";
import { AwsController } from "./aws.controller";

@Module({
  imports: [ConfigModule],
  controllers: [AwsController],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
