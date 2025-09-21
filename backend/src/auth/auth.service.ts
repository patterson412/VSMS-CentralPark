import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Admin } from "./entities/admin.entity";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Admin | null> {
    const admin = await this.adminRepository.findOne({ where: { username } });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      return admin;
    }
    return null;
  }

  async validateUserById(id: string): Promise<Admin | null> {
    try {
      return await this.adminRepository.findOne({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;

    const admin = await this.validateUser(username, password);
    if (!admin) {
      throw new UnauthorizedException("Invalid username or password");
    }

    const payload = { username: admin.username, sub: admin.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async createAdmin(username: string, password: string): Promise<Admin> {
    const hashedPassword = await this.hashPassword(password);

    const admin = this.adminRepository.create({
      username,
      password: hashedPassword,
    });

    return this.adminRepository.save(admin);
  }

  async findAdminByUsername(username: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { username } });
  }
}
