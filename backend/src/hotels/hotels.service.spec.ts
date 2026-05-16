import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { PrismaService } from '../prisma/prisma.service';
import { HotelStatus } from '@prisma/client';

const mockPrismaService = {
  hotel: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('HotelsService', () => {
  let service: HotelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated list of hotels', async () => {
      const hotels = [{ id: 'h1', name: 'Hotel A', city: 'Cairo' }];
      mockPrismaService.hotel.findMany.mockResolvedValue(hotels);
      mockPrismaService.hotel.count.mockResolvedValue(1);

      const result = await service.findAll(undefined, 1, 10);

      expect(result.data).toEqual(hotels);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockPrismaService.hotel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should filter by city when search matches city', async () => {
      mockPrismaService.hotel.findMany.mockResolvedValue([]);
      mockPrismaService.hotel.count.mockResolvedValue(0);

      await service.findAll('Cairo', 1, 10);

      expect(mockPrismaService.hotel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              expect.objectContaining({
                OR: [
                  { name: { contains: 'Cairo', mode: 'insensitive' } },
                  { city: { contains: 'Cairo', mode: 'insensitive' } },
                  { address: { contains: 'Cairo', mode: 'insensitive' } },
                ],
              }),
            ],
          }),
        }),
      );
    });

    it('should filter by name when search matches name', async () => {
      mockPrismaService.hotel.findMany.mockResolvedValue([]);
      mockPrismaService.hotel.count.mockResolvedValue(0);

      await service.findAll('Grand', 1, 10);

      expect(mockPrismaService.hotel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { name: { contains: 'Grand', mode: 'insensitive' } },
                ]),
              }),
            ],
          }),
        }),
      );
    });

    it('should filter by address when search matches address', async () => {
      mockPrismaService.hotel.findMany.mockResolvedValue([]);
      mockPrismaService.hotel.count.mockResolvedValue(0);

      await service.findAll('Test St', 1, 10);

      expect(mockPrismaService.hotel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { address: { contains: 'Test', mode: 'insensitive' } },
                ]),
              }),
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { address: { contains: 'St', mode: 'insensitive' } },
                ]),
              }),
            ],
          }),
        }),
      );
    });

    it('should return empty array if no hotels match the search', async () => {
      mockPrismaService.hotel.findMany.mockResolvedValue([]);
      mockPrismaService.hotel.count.mockResolvedValue(0);

      const result = await service.findAll('NonExistent', 1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should filter active hotels only when activeOnly is true', async () => {
      mockPrismaService.hotel.findMany.mockResolvedValue([]);
      mockPrismaService.hotel.count.mockResolvedValue(0);

      await service.findAll(undefined, 1, 10, true);

      expect(mockPrismaService.hotel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: HotelStatus.ACTIVE }),
        }),
      );
    });
  });

  describe('create', () => {
    it('should create a hotel with all required fields', async () => {
      const dto = {
        name: 'Test Hotel',
        city: 'Cairo',
        address: '123 Test St',
        stars: 4,
        managerId: 'mgr-1',
        status: HotelStatus.ACTIVE,
      };
      mockPrismaService.hotel.create.mockResolvedValue({
        id: 'hotel-1',
        ...dto,
      });

      const result = await service.create(dto);

      expect(mockPrismaService.hotel.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result.id).toBe('hotel-1');
      expect(result.stars).toBe(4);
    });
  });

  describe('remove', () => {
    it('should delete hotel successfully', async () => {
      mockPrismaService.hotel.findUnique.mockResolvedValue({ id: 'hotel-1' });
      mockPrismaService.hotel.delete.mockResolvedValue({ id: 'hotel-1' });

      await service.remove('hotel-1');

      expect(mockPrismaService.hotel.delete).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
      });
    });

    it('should throw NotFoundException if hotel does not exist', async () => {
      mockPrismaService.hotel.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.hotel.delete).not.toHaveBeenCalled();
    });
  });
});
