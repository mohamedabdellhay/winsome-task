import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Role } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    if (dto.role && dto.role !== Role.USER) {
      throw new ForbiddenException("Only admins can assign elevated roles");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role ?? Role.USER,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
    user: this.sanitizeUser(user),
    message: "User created successfully"
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        managedHotel: {
          select: { id: true },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(payload: { sub: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        managedHotel: {
          select: { id: true },
        },
      },
    });
    return user || null;
  }

  async findManagers() {
    return this.prisma.user.findMany({
      where: { 
        role: Role.HOTEL_MANAGER,
        managedHotel: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async adminCreateUser(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role ?? Role.USER,
      },
    });

    return {
      user: this.sanitizeUser(user),
      message: "User created successfully by admin",
    };
  }
}
