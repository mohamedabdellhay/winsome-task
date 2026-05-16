import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, Role } from '@prisma/client';

const mockPrismaService = {
  booking: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  room: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

const regularUser = { id: 'user-1', role: Role.USER };
const adminUser = { id: 'admin-1', role: Role.ADMIN };

function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    jest.clearAllMocks();

    mockPrismaService.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrismaService) => unknown) =>
        cb(mockPrismaService),
    );
  });

  describe('create', () => {
    const baseDto = {
      hotelId: 'hotel-1',
      roomId: 'room-1',
      checkIn: futureDate(5),
      checkOut: futureDate(9),
      guestCount: 2,
    };

    const mockRoom = {
      id: 'room-1',
      hotelId: 'hotel-1',
      capacity: 4,
      pricePerNight: 100,
      availableCount: 3,
      hotel: { id: 'hotel-1' },
    };

    it('should calculate total price correctly for 4 nights at 100/night', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.booking.count.mockResolvedValue(0);
      mockPrismaService.room.update.mockResolvedValue({
        ...mockRoom,
        availableCount: 2,
      });
      mockPrismaService.booking.create.mockResolvedValue({
        id: 'booking-1',
        totalPrice: 400,
        status: BookingStatus.PENDING,
        userId: 'user-1',
        hotelId: 'hotel-1',
        roomId: 'room-1',
      });

      const dto = {
        ...baseDto,
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
      };

      const result = await service.create(dto, regularUser);

      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalPrice: 400 }),
        }),
      );
      expect(Number(result.totalPrice)).toBe(400);
    });

    it('should calculate total price correctly for 1 night at 250/night', async () => {
      const room = { ...mockRoom, pricePerNight: 250 };
      mockPrismaService.room.findUnique.mockResolvedValue(room);
      mockPrismaService.booking.count.mockResolvedValue(0);
      mockPrismaService.room.update.mockResolvedValue(room);
      mockPrismaService.booking.create.mockResolvedValue({
        id: 'booking-2',
        totalPrice: 250,
        status: BookingStatus.PENDING,
      });

      const dto = {
        ...baseDto,
        checkIn: '2026-06-10',
        checkOut: '2026-06-11',
      };

      await service.create(dto, regularUser);

      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalPrice: 250 }),
        }),
      );
    });

    it('should throw BadRequestException if checkOut is before checkIn', async () => {
      await expect(
        service.create(
          {
            ...baseDto,
            checkIn: futureDate(10),
            checkOut: futureDate(5),
          },
          regularUser,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if checkIn is in the past', async () => {
      const past = new Date();
      past.setDate(past.getDate() - 2);

      await expect(
        service.create(
          {
            ...baseDto,
            checkIn: past.toISOString().split('T')[0],
            checkOut: futureDate(5),
          },
          regularUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if room has no available rooms', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue({
        ...mockRoom,
        availableCount: 0,
      });

      await expect(service.create(baseDto, regularUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not mutate the room inventory count during booking creation', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.booking.count.mockResolvedValue(0);
      mockPrismaService.booking.create.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PENDING,
      });

      await service.create(baseDto, regularUser);

      expect(mockPrismaService.room.update).not.toHaveBeenCalled();
    });

    it('should create booking with status PENDING by default', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.booking.count.mockResolvedValue(0);
      mockPrismaService.room.update.mockResolvedValue(mockRoom);
      mockPrismaService.booking.create.mockResolvedValue({
        id: 'booking-1',
        status: BookingStatus.PENDING,
      });

      await service.create(baseDto, regularUser);

      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: BookingStatus.PENDING }),
        }),
      );
    });

    it('should save the correct userId, hotelId, roomId from the input', async () => {
      mockPrismaService.room.findUnique.mockResolvedValue(mockRoom);
      mockPrismaService.booking.count.mockResolvedValue(0);
      mockPrismaService.room.update.mockResolvedValue(mockRoom);
      mockPrismaService.booking.create.mockResolvedValue({ id: 'booking-1' });

      await service.create(baseDto, regularUser);

      expect(mockPrismaService.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            hotelId: 'hotel-1',
            roomId: 'room-1',
          }),
        }),
      );
    });

    it('should throw ForbiddenException for hotel managers', async () => {
      await expect(
        service.create(baseDto, { id: 'mgr-1', role: Role.HOTEL_MANAGER }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    const existingBooking = {
      id: 'booking-1',
      userId: 'user-1',
      roomId: 'room-1',
      status: BookingStatus.PENDING,
      hotel: { managerId: 'mgr-1' },
    };

    it('should update status to CONFIRMED', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(existingBooking);
      mockPrismaService.booking.update.mockResolvedValue({
        ...existingBooking,
        status: BookingStatus.CONFIRMED,
      });

      const result = await service.updateStatus(
        'booking-1',
        BookingStatus.CONFIRMED,
        adminUser,
      );

      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should update status to CANCELLED', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(existingBooking);
      mockPrismaService.booking.update.mockResolvedValue({
        ...existingBooking,
        status: BookingStatus.CANCELLED,
      });

      const result = await service.updateStatus(
        'booking-1',
        BookingStatus.CANCELLED,
        adminUser,
      );

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(mockPrismaService.room.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing', BookingStatus.CONFIRMED, adminUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return only bookings belonging to the requesting user', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([
        { id: 'b1', userId: 'user-1' },
      ]);
      mockPrismaService.booking.count.mockResolvedValue(1);

      const result = await service.findAll(regularUser);

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('should return all bookings if user role is ADMIN', async () => {
      mockPrismaService.booking.findMany.mockResolvedValue([
        { id: 'b1' },
        { id: 'b2' },
      ]);
      mockPrismaService.booking.count.mockResolvedValue(2);

      const result = await service.findAll(adminUser);

      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(result.data).toHaveLength(2);
    });
  });
});
