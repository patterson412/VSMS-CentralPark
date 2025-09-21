import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { Vehicle } from "./entities/vehicle.entity";
import { OpenaiService } from "../openai/openai.service";
import { AwsService } from "../aws/aws.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

describe("VehiclesService", () => {
  let service: VehiclesService;

  const mockVehicle: Vehicle = {
    id: "1",
    type: "Car",
    brand: "Toyota",
    model: "Camry",
    color: "Silver",
    engineSize: "2.5L",
    year: 2023,
    price: 28500,
    description: "Test description",
    images: ["image1.jpg"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOpenaiService = {
    generateVehicleDescription: jest.fn(),
  };

  const mockAwsService = {
    uploadVehicleImages: jest.fn(),
    deleteVehicleImages: jest.fn(),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    where: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepository,
        },
        {
          provide: OpenaiService,
          useValue: mockOpenaiService,
        },
        {
          provide: AwsService,
          useValue: mockAwsService,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated vehicles", async () => {
      const vehicles = [mockVehicle];
      const total = 1;

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(total);
      mockQueryBuilder.getMany.mockResolvedValue(vehicles);

      const result = await service.findAll();

      expect(result).toEqual({
        data: vehicles,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it("should apply filters correctly", async () => {
      const filters = {
        brand: "Toyota",
        type: "Car",
        minPrice: 20000,
        maxPrice: 50000,
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockVehicle]);

      await service.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "vehicle.brand LIKE :brand",
        { brand: "%Toyota%" },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "vehicle.type = :type",
        { type: "Car" },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "vehicle.price >= :minPrice",
        { minPrice: 20000 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "vehicle.price <= :maxPrice",
        { maxPrice: 50000 },
      );
    });
  });

  describe("findOne", () => {
    it("should return a vehicle when found", async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findOne("1");

      expect(result).toEqual(mockVehicle);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should throw NotFoundException when vehicle not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    const createVehicleDto: CreateVehicleDto = {
      type: "Car",
      brand: "Toyota",
      model: "Camry",
      color: "Silver",
      engineSize: "2.5L",
      year: 2023,
      price: 28500,
    };

    it("should create a vehicle with provided description", async () => {
      const vehicleWithDescription = {
        ...createVehicleDto,
        description: "Custom description",
      };

      mockRepository.create.mockReturnValue(mockVehicle);
      mockRepository.save.mockResolvedValue(mockVehicle);

      const result = await service.create(vehicleWithDescription);

      expect(result).toEqual(mockVehicle);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...vehicleWithDescription,
        images: [],
      });
      expect(
        mockOpenaiService.generateVehicleDescription,
      ).not.toHaveBeenCalled();
    });

    it("should create a vehicle and generate AI description when none provided", async () => {
      const aiDescription = "AI generated description";

      mockRepository.create.mockReturnValue(mockVehicle);
      mockRepository.save.mockResolvedValue(mockVehicle);
      mockOpenaiService.generateVehicleDescription.mockResolvedValue(
        aiDescription,
      );

      const result = await service.create(createVehicleDto);

      expect(result).toEqual(mockVehicle);
      expect(mockOpenaiService.generateVehicleDescription).toHaveBeenCalledWith(
        mockVehicle,
      );
      expect(mockRepository.save).toHaveBeenCalledTimes(2); // Once for initial save, once for description update
    });

    it("should handle AI description generation failure gracefully", async () => {
      mockRepository.create.mockReturnValue(mockVehicle);
      mockRepository.save.mockResolvedValue(mockVehicle);
      mockOpenaiService.generateVehicleDescription.mockRejectedValue(
        new Error("AI service error"),
      );

      const result = await service.create(createVehicleDto);

      expect(result).toEqual(mockVehicle);
      expect(mockRepository.save).toHaveBeenCalledTimes(1); // Only initial save
    });
  });

  describe("update", () => {
    const updateVehicleDto: UpdateVehicleDto = {
      price: 30000,
    };

    it("should update a vehicle successfully", async () => {
      const updatedVehicle = { ...mockVehicle, price: 30000 };

      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.save.mockResolvedValue(updatedVehicle);

      const result = await service.update("1", updateVehicleDto);

      expect(result).toEqual(updatedVehicle);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when vehicle not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", updateVehicleDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a vehicle successfully", async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.remove.mockResolvedValue(mockVehicle);

      await service.remove("1");

      expect(mockRepository.remove).toHaveBeenCalledWith(mockVehicle);
    });

    it("should throw NotFoundException when vehicle not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("generateDescription", () => {
    it("should generate and update vehicle description", async () => {
      const newDescription = "New AI generated description";
      const updatedVehicle = { ...mockVehicle, description: newDescription };

      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockOpenaiService.generateVehicleDescription.mockResolvedValue(
        newDescription,
      );
      mockRepository.save.mockResolvedValue(updatedVehicle);

      const result = await service.generateDescription("1");

      expect(result).toEqual({ description: newDescription });
      expect(mockOpenaiService.generateVehicleDescription).toHaveBeenCalledWith(
        mockVehicle,
      );
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockVehicle,
        description: newDescription,
      });
    });

    it("should throw NotFoundException when vehicle not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.generateDescription("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple vehicles", async () => {
      const ids = ["1", "2", "3"];
      const vehiclesToDelete = [
        { ...mockVehicle, id: "1", images: ["image1.jpg"] },
        { ...mockVehicle, id: "2", images: ["image2.jpg"] },
        { ...mockVehicle, id: "3", images: [] },
      ];

      mockRepository.findBy.mockResolvedValue(vehiclesToDelete);
      mockRepository.delete.mockResolvedValue({ affected: 3 });

      const result = await service.bulkDelete(ids);

      expect(result).toEqual({ deleted: 3 });
      expect(mockRepository.findBy).toHaveBeenCalledWith({
        id: expect.anything(),
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(ids);
    });

    it("should throw BadRequestException when no IDs provided", async () => {
      await expect(service.bulkDelete([])).rejects.toThrow(BadRequestException);
    });
  });

  describe("getVehicleStats", () => {
    it("should return vehicle statistics", async () => {
      mockRepository.count.mockResolvedValue(10);
      mockRepository.createQueryBuilder
        .mockReturnValueOnce({
          ...mockQueryBuilder,
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([
            { type: "Car", count: "5" },
            { type: "SUV", count: "3" },
            { type: "Bike", count: "2" },
          ]),
        })
        .mockReturnValueOnce({
          ...mockQueryBuilder,
          select: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ avgPrice: 35000 }),
        })
        .mockReturnValueOnce({
          ...mockQueryBuilder,
          select: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ totalValue: 350000 }),
        })
        .mockReturnValueOnce({
          ...mockQueryBuilder,
          where: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(2),
        });

      const result = await service.getVehicleStats();

      expect(result.totalVehicles).toBe(10);
      expect(result.averagePrice).toBe(35000);
      expect(result.recentlyAdded).toBe(2);
      expect(result.vehicleTypes).toHaveLength(3);
    });
  });
});
