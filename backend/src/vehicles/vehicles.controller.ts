import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { VehicleFiltersDto } from "./dto/vehicle-filters.dto";
import { Vehicle } from "./entities/vehicle.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("vehicles")
@Controller("vehicles")
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: "Get all vehicles",
    description:
      "Retrieve all vehicles with optional filtering, search, sorting, and pagination",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved vehicles",
    schema: {
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/Vehicle" },
        },
        total: { type: "number" },
        page: { type: "number" },
        limit: { type: "number" },
        totalPages: { type: "number" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid query parameters" })
  async findAll(@Query() filters: VehicleFiltersDto) {
    return this.vehiclesService.findAll(filters);
  }

  @Public()
  @Get("stats")
  @ApiOperation({
    summary: "Get vehicle statistics",
    description: "Retrieve statistics about the vehicle inventory",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved statistics",
  })
  async getStats() {
    return this.vehiclesService.getVehicleStats();
  }

  @Public()
  @Get(":id")
  @ApiOperation({
    summary: "Get single vehicle",
    description: "Retrieve a specific vehicle by ID",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved vehicle",
    type: Vehicle,
  })
  @ApiResponse({ status: 404, description: "Vehicle not found" })
  async findOne(@Param("id") id: string): Promise<Vehicle> {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiTags("admin")
  @ApiOperation({
    summary: "Create new vehicle",
    description:
      "Create a new vehicle in the inventory. Admin authentication required.",
  })
  @ApiResponse({
    status: 201,
    description: "Vehicle created successfully",
    type: Vehicle,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  @ApiResponse({ status: 400, description: "Invalid vehicle data" })
  async create(@Body() createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiTags("admin")
  @ApiOperation({
    summary: "Update vehicle",
    description: "Update an existing vehicle. Admin authentication required.",
  })
  @ApiResponse({
    status: 200,
    description: "Vehicle updated successfully",
    type: Vehicle,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  @ApiResponse({ status: 404, description: "Vehicle not found" })
  @ApiResponse({ status: 400, description: "Invalid vehicle data" })
  async update(
    @Param("id") id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiTags("admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete vehicle",
    description:
      "Delete a vehicle from the inventory. Admin authentication required.",
  })
  @ApiResponse({
    status: 204,
    description: "Vehicle deleted successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  @ApiResponse({ status: 404, description: "Vehicle not found" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.vehiclesService.remove(id);
  }

  @Post(":id/generate-description")
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute for AI generation
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiTags("admin")
  @ApiOperation({
    summary: "Generate AI description",
    description:
      "Generate a new AI-powered description for a vehicle. Admin authentication required. Rate limited to 3 requests per minute.",
  })
  @ApiResponse({
    status: 200,
    description: "Description generated successfully",
    schema: {
      properties: {
        description: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  @ApiResponse({ status: 404, description: "Vehicle not found" })
  @ApiResponse({ status: 429, description: "Too many requests - rate limit exceeded" })
  @ApiResponse({ status: 500, description: "Failed to generate description" })
  async generateDescription(@Param("id") id: string) {
    return this.vehiclesService.generateDescription(id);
  }

  @Delete("bulk/delete")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiTags("admin")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Bulk delete vehicles",
    description:
      "Delete multiple vehicles at once. Admin authentication required.",
  })
  @ApiResponse({
    status: 200,
    description: "Vehicles deleted successfully",
    schema: {
      properties: {
        deleted: { type: "number" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - JWT token required",
  })
  @ApiResponse({ status: 400, description: "Invalid request data" })
  async bulkDelete(@Body("ids") ids: string[]) {
    return this.vehiclesService.bulkDelete(ids);
  }
}
