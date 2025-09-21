import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  ArrayMaxSize,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateVehicleDto {
  @ApiProperty({
    description: "Type of vehicle",
    example: "Car",
    enum: ["Car", "Bike", "SUV", "Truck", "Van"],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: "Vehicle brand",
    example: "Toyota",
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    description: "Vehicle model name",
    example: "Camry",
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    description: "Vehicle color",
    example: "Blue",
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    description: "Engine size specification",
    example: "2.5L",
  })
  @IsString()
  @IsNotEmpty()
  engineSize: string;

  @ApiProperty({
    description: "Manufacturing year",
    example: 2023,
    minimum: 1900,
    maximum: 2030,
  })
  @IsNumber()
  @Min(1900)
  @Max(2030)
  @Transform(({ value }) => parseInt(value))
  year: number;

  @ApiProperty({
    description: "Vehicle price in USD",
    example: 25000.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({
    description: "Vehicle description (optional - can be AI generated)",
    example: "Experience the perfect blend of reliability and performance...",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Array of image URLs",
    example: ["https://cloudfront-url.com/vehicle1/image1.jpg"],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  images?: string[];
}
