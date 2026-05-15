import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should hash the password before saving', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        ...registerDto,
        password: 'hashed-password',
        role: Role.USER,
      });
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ password: 'hashed-password' }),
      });
    });

    it('should create a new user and return a JWT token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      const createdUser = {
        id: 'user-1',
        name: registerDto.name,
        email: registerDto.email,
        password: 'hashed-password',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: registerDto.email,
        role: Role.USER,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should not return the password field in the response', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        name: registerDto.name,
        email: registerDto.email,
        password: 'hashed-password',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw ForbiddenException when registering with elevated role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.register({ ...registerDto, role: Role.ADMIN }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should return a JWT token for valid credentials', async () => {
      const user = {
        id: 'user-1',
        email: loginDto.email,
        password: 'hashed-password',
        role: Role.USER,
        name: 'Test',
        managedHotel: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        password: 'hashed-password',
        role: Role.USER,
        managedHotel: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
