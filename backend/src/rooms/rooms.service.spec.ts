import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

const mockPrismaService = {
  room: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  hotel: {
    findUnique: jest.fn(),
  },
};

const managerUser = { id: 'mgr-1', role: Role.HOTEL_MANAGER };
const adminUser = { id: 'admin-1', role: Role.ADMIN };
const otherManager = { id: 'mgr-2', role: Role.HOTEL_MANAGER };

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      type: 'Double',
      capacity: 2,
      pricePerNight: 150,
      availableCount: 5,
      hotelId: 'hotel-1',
    };

    it('should add a room to an existing hotel', async () => {
      mockPrismaService.hotel.findUnique.mockResolvedValue({
        id: 'hotel-1',
        managerId: 'mgr-1',
      });
      mockPrismaService.room.create.mockResolvedValue({ id: 'room-1', ...createDto });

      const result = await service.create(createDto, managerUser);

      expect(mockPrismaService.room.create).toHaveBeenCalledWith({ data: createDto });
      expect(result.id).toBe('room-1');
    });

    it('should throw ForbiddenException if hotel does not exist', async () => {
      mockPrismaService.hotel.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, managerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if requesting user is not the hotel manager', async () => {
      mockPrismaService.hotel.findUnique.mockResolvedValue({
        id: 'hotel-1',
        managerId: 'mgr-1',
      });

      await expect(service.create(createDto, otherManager)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin to create room for any hotel', async () => {
      mockPrismaService.hotel.findUnique.mockResolvedValue({
        id: 'hotel-1',
        managerId: 'mgr-1',
      });
      mockPrismaService.room.create.mockResolvedValue({ id: 'room-1' });

      await service.create(createDto, adminUser);

      expect(mockPrismaService.room.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const existingRoom = {
      id: 'room-1',
      hotelId: 'hotel-1',
      type: 'Double',
      capacity: 2,
      pricePerNight: 100,
      availableCount: 3,
    };

    it('should update pricePerNight correctly', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(existingRoom);
      mockPrismaService.hotel.findUnique.mockResolvedValue({
        id: 'hotel-1',
        managerId: 'mgr-1',
      });
      mockPrismaService.room.update.mockResolvedValue({
        ...existingRoom,
        pricePerNight: 200,
      });

      const result = await service.update(
        'room-1',
        { pricePerNight: 200 },
        managerUser,
      );

      expect(mockPrismaService.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { pricePerNight: 200 },
      });
      expect(Number(result.pricePerNight)).toBe(200);
    });

    it('should update availableCount correctly', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(existingRoom);
      mockPrismaService.hotel.findUnique.mockResolvedValue({
        id: 'hotel-1',
        managerId: 'mgr-1',
      });
      mockPrismaService.room.update.mockResolvedValue({
        ...existingRoom,
        availableCount: 10,
      });

      const result = await service.update(
        'room-1',
        { availableCount: 10 },
        managerUser,
      );

      expect(mockPrismaService.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { availableCount: 10 },
      });
      expect(result.availableCount).toBe(10);
    });

    it('should throw NotFoundException if room does not exist', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', { pricePerNight: 100 }, managerUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
