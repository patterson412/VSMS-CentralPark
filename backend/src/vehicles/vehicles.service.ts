import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Vehicle } from "./entities/vehicle.entity";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { VehicleFiltersDto } from "./dto/vehicle-filters.dto";
import { OpenaiService } from "../openai/openai.service";
import { AwsService } from "../aws/aws.service";

export interface PaginatedVehicles {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service responsible for vehicle management operations
 * Handles CRUD operations, filtering, and business logic for vehicles
 * @class VehiclesService
 */
@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private openaiService: OpenaiService,
    private awsService: AwsService,
  ) {}

  /**
   * Find all vehicles with optional filtering and pagination
   * @param {VehicleFiltersDto} filters - Optional filters for vehicles
   * @returns {Promise<PaginatedVehicles>} Paginated list of vehicles matching the criteria
   * @throws {BadRequestException} When filter parameters are invalid
   * @example
   * const vehicles = await vehiclesService.findAll({ brand: 'Toyota', year: 2023 });
   */
  async findAll(filters?: VehicleFiltersDto): Promise<PaginatedVehicles> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 6;
    const skip = (page - 1) * limit;

    const queryBuilder = this.vehicleRepository.createQueryBuilder("vehicle");

    if (filters?.type) {
      queryBuilder.andWhere("vehicle.type = :type", { type: filters.type });
    }

    if (filters?.brand) {
      queryBuilder.andWhere("LOWER(vehicle.brand) LIKE LOWER(:brand)", {
        brand: `%${filters.brand}%`,
      });
    }

    if (filters?.model) {
      queryBuilder.andWhere("LOWER(vehicle.model) LIKE LOWER(:model)", {
        model: `%${filters.model}%`,
      });
    }

    if (filters?.color) {
      queryBuilder.andWhere("LOWER(vehicle.color) LIKE LOWER(:color)", {
        color: `%${filters.color}%`,
      });
    }

    if (filters?.engineSize) {
      queryBuilder.andWhere("LOWER(vehicle.engineSize) LIKE LOWER(:engineSize)", {
        engineSize: `%${filters.engineSize}%`,
      });
    }

    if (filters?.year) {
      queryBuilder.andWhere("vehicle.year = :year", { year: filters.year });
    }

    if (filters?.minPrice !== undefined) {
      queryBuilder.andWhere("vehicle.price >= :minPrice", {
        minPrice: filters.minPrice,
      });
    }

    if (filters?.maxPrice !== undefined) {
      queryBuilder.andWhere("vehicle.price <= :maxPrice", {
        maxPrice: filters.maxPrice,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        "(LOWER(vehicle.brand) LIKE LOWER(:search) OR LOWER(vehicle.model) LIKE LOWER(:search) OR LOWER(vehicle.description) LIKE LOWER(:search))",
        { search: `%${filters.search}%` },
      );
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder || "DESC";

    const validSortFields = ["price", "year", "createdAt", "brand", "model", "featured"];
    if (sortBy === "featured") {
      // Always sort featured vehicles first, then by createdAt DESC (or another secondary sort)
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy("vehicle.createdAt", "DESC");
    } else if (validSortFields.includes(sortBy)) {
      // If not sorting by featured, still sort featured vehicles first by default
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy(`vehicle.${sortBy}`, sortOrder);
    } else {
      // Default sort: featured first, then createdAt DESC
      queryBuilder.orderBy("vehicle.featured", "DESC")
                  .addOrderBy("vehicle.createdAt", "DESC");
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const vehicles = await queryBuilder.skip(skip).take(limit).getMany();

    return {
      data: vehicles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${id}" not found`);
    }

    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    try {
      const vehicle = this.vehicleRepository.create({
        ...createVehicleDto,
        description:
          createVehicleDto.description ||
          "Vehicle description will be generated.",
        images: createVehicleDto.images || [],
      });

      const savedVehicle = await this.vehicleRepository.save(vehicle);

      // Generate AI description if not provided
      if (!createVehicleDto.description) {
        try {
          const aiDescription =
            await this.openaiService.generateVehicleDescription(savedVehicle);
          savedVehicle.description = aiDescription;
          await this.vehicleRepository.save(savedVehicle);
        } catch (error) {
          console.warn(
            "Failed to generate AI description:",
            (error as Error).message,
          );
        }
      }

      return savedVehicle;
    } catch (error) {
      throw new BadRequestException("Failed to create vehicle");
    }
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id);

    try {
      Object.assign(vehicle, updateVehicleDto);
      return await this.vehicleRepository.save(vehicle);
    } catch (error) {
      throw new BadRequestException("Failed to update vehicle");
    }
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);

    try {
      if (vehicle.images && vehicle.images.length > 0) {
        await this.deleteVehicleImages(vehicle.images);
      }

      await this.vehicleRepository.remove(vehicle);
    } catch (error) {
      throw new BadRequestException("Failed to delete vehicle");
    }
  }

  /**
   * Generate AI-powered description for a vehicle
   * @param {string} id - The unique identifier of the vehicle
   * @returns {Promise<{description: string}>} Generated description from OpenAI
   * @throws {NotFoundException} When vehicle with given ID is not found
   * @throws {InternalServerErrorException} When OpenAI API fails
   */
  async generateDescription(id: string): Promise<{ description: string }> {
    const vehicle = await this.findOne(id);

    try {
      const description =
        await this.openaiService.generateVehicleDescription(vehicle);

      vehicle.description = description;
      await this.vehicleRepository.save(vehicle);

      return { description };
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to generate vehicle description",
      );
    }
  }

  async generateDescriptionFromData(vehicleData: CreateVehicleDto): Promise<{ description: string }> {
    try {
      
      const tempVehicle = {
        ...vehicleData,
        id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Vehicle;

      const description = await this.openaiService.generateVehicleDescription(tempVehicle);
      return { description };
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to generate vehicle description",
      );
    }
  }

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException("No vehicle IDs provided");
    }

    try {
      const vehicles = await this.vehicleRepository.findBy({
        id: In(ids),
      });

      const allImageUrls: string[] = [];
      vehicles.forEach((vehicle) => {
        if (vehicle.images && vehicle.images.length > 0) {
          allImageUrls.push(...vehicle.images);
        }
      });

      if (allImageUrls.length > 0) {
        await this.deleteVehicleImages(allImageUrls);
      }

      const result = await this.vehicleRepository.delete(ids);
      return { deleted: result.affected || 0 };
    } catch (error) {
      throw new BadRequestException("Failed to delete vehicles");
    }
  }

  async getVehicleStats() {
    const [total, byType, avgPrice, totalValue, recentCount] =
      await Promise.all([
        this.vehicleRepository.count(),
        this.vehicleRepository
          .createQueryBuilder("vehicle")
          .select("vehicle.type", "type")
          .addSelect("COUNT(*)", "count")
          .groupBy("vehicle.type")
          .getRawMany(),
        this.vehicleRepository
          .createQueryBuilder("vehicle")
          .select("AVG(vehicle.price)", "avgPrice")
          .getRawOne(),
        this.vehicleRepository
          .createQueryBuilder("vehicle")
          .select("SUM(vehicle.price)", "totalValue")
          .getRawOne(),
        this.vehicleRepository
          .createQueryBuilder("vehicle")
          .where("vehicle.createdAt >= :date", {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          })
          .getCount(),
      ]);

    const vehicleTypes = byType.map((item) => ({
      type: item.type,
      count: parseInt(item.count, 10), // Convert string count to number
    }));

    return {
      totalVehicles: total,
      vehicleTypes,
      averagePrice: parseFloat(avgPrice?.avgPrice || "0"),
      totalValue: parseFloat(totalValue?.totalValue || "0"),
      recentlyAdded: recentCount,
    };
  }

  /**
   * Helper method to delete vehicle images from S3
   * @param {string[]} imageUrls - Array of CloudFront/S3 URLs to delete
   * @private
   */
  private async deleteVehicleImages(imageUrls: string[]): Promise<void> {
    try {
      const deletePromises = imageUrls.map(async (imageUrl) => {
        try {
          const url = new URL(imageUrl);
          const key = url.pathname.substring(1);
          await this.awsService.deleteImage(key);
        } catch (deleteError) {
          console.error(
            "Failed to delete image from S3:",
            imageUrl,
            deleteError,
          );
        }
      });

      await Promise.allSettled(deletePromises);
    } catch (error) {
      console.error("Error during bulk image deletion:", error);
    }
  }
}
