import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { Admin } from "./entities/admin.entity";
import { LoginDto } from "./dto/login.dto";

describe("AuthService", () => {
  let service: AuthService;
  let adminRepository: Repository<Admin>;
  let jwtService: JwtService;

  const mockAdmin: Admin = {
    id: "1",
    username: "testuser",
    password: "hashedpassword",
    createdAt: new Date(),
  };

  const mockAdminRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockAdminRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    adminRepository = module.get<Repository<Admin>>(getRepositoryToken(Admin));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("should return admin when credentials are valid", async () => {
      const plainPassword = "testpassword";
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      mockAdminRepository.findOne.mockResolvedValue({
        ...mockAdmin,
        password: hashedPassword,
      });

      const result = await service.validateUser("testuser", plainPassword);

      expect(result).toEqual({
        ...mockAdmin,
        password: hashedPassword,
      });
      expect(mockAdminRepository.findOne).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
    });

    it("should return null when user is not found", async () => {
      mockAdminRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser("nonexistent", "password");

      expect(result).toBeNull();
    });

    it("should return null when password is incorrect", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 12);

      mockAdminRepository.findOne.mockResolvedValue({
        ...mockAdmin,
        password: hashedPassword,
      });

      const result = await service.validateUser("testuser", "wrongpassword");

      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return access token and user info when credentials are valid", async () => {
      const loginDto: LoginDto = {
        username: "testuser",
        password: "testpassword",
      };
      const hashedPassword = await bcrypt.hash("testpassword", 12);
      const mockToken = "jwt-token";

      mockAdminRepository.findOne.mockResolvedValue({
        ...mockAdmin,
        password: hashedPassword,
      });
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockAdmin.id,
          username: mockAdmin.username,
          createdAt: mockAdmin.createdAt,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: mockAdmin.username,
        sub: mockAdmin.id,
      });
    });

    it("should throw UnauthorizedException when credentials are invalid", async () => {
      const loginDto: LoginDto = {
        username: "testuser",
        password: "wrongpassword",
      };

      mockAdminRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("validateUserById", () => {
    it("should return admin when ID exists", async () => {
      mockAdminRepository.findOne.mockResolvedValue(mockAdmin);

      const result = await service.validateUserById("1");

      expect(result).toEqual(mockAdmin);
      expect(mockAdminRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should return null when ID does not exist", async () => {
      mockAdminRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUserById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("hashPassword", () => {
    it("should return hashed password", async () => {
      const password = "testpassword";
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
    });
  });

  describe("createAdmin", () => {
    it("should create and save admin with hashed password", async () => {
      const username = "newuser";
      const password = "newpassword";
      const createdAdmin = { ...mockAdmin, username };

      mockAdminRepository.create.mockReturnValue(createdAdmin);
      mockAdminRepository.save.mockResolvedValue(createdAdmin);

      const result = await service.createAdmin(username, password);

      expect(result).toEqual(createdAdmin);
      expect(mockAdminRepository.create).toHaveBeenCalled();
      expect(mockAdminRepository.save).toHaveBeenCalledWith(createdAdmin);
    });
  });

  describe("findAdminByUsername", () => {
    it("should return admin when username exists", async () => {
      mockAdminRepository.findOne.mockResolvedValue(mockAdmin);

      const result = await service.findAdminByUsername("testuser");

      expect(result).toEqual(mockAdmin);
      expect(mockAdminRepository.findOne).toHaveBeenCalledWith({
        where: { username: "testuser" },
      });
    });

    it("should return null when username does not exist", async () => {
      mockAdminRepository.findOne.mockResolvedValue(null);

      const result = await service.findAdminByUsername("nonexistent");

      expect(result).toBeNull();
    });
  });
});
