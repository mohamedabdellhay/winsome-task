import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, Role } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, user: any) {
    if (user.role === Role.HOTEL_MANAGER) {
      throw new ForbiddenException('Hotel managers are not allowed to make bookings.');
    }

    const userId = user.id;
    const { hotelId, roomId, checkIn, checkOut, guestCount } = createBookingDto;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-in date must be before check-out date.');
    }

    if (checkInDate < today) {
      throw new BadRequestException('Check-in date cannot be in the past.');
    }

    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: { hotel: true },
      });

      if (!room || room.hotelId !== hotelId) {
        throw new NotFoundException('Room not found in the specified hotel.');
      }

      if (guestCount > room.capacity) {
        throw new BadRequestException(
          `Room capacity exceeded. Maximum ${room.capacity} guests allowed.`,
        );
      }

      const overlappingBookings = await tx.booking.count({
        where: {
          roomId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          AND: [
            { checkIn: { lt: checkOutDate } },
            { checkOut: { gt: checkInDate } },
          ],
        },
      });

      if (overlappingBookings >= room.availableCount) {
        throw new BadRequestException('Room is not available for the selected dates.');
      }

      const totalPrice = Number(room.pricePerNight) * diffDays;

      return tx.booking.create({
        data: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guestCount,
          totalPrice,
          status: BookingStatus.PENDING,
          userId,
          hotelId,
          roomId,
        },
        include: {
          hotel: true,
          room: true,
        },
      });
    });
  }

  async findAll(user: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    let where = {};

    if (user.role === Role.ADMIN) {
      where = {};
    } else if (user.role === Role.HOTEL_MANAGER) {
      where = { hotel: { managerId: user.id } };
    } else {
      where = { userId: user.id };
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { hotel: true, room: true, user: true },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { hotel: true, room: true, user: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (user.role === Role.ADMIN) return booking;

    if (user.role === Role.HOTEL_MANAGER && booking.hotel.managerId === user.id) {
      return booking;
    }

    if (booking.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this booking.');
    }

    return booking;
  }

  async updateStatus(id: string, status: BookingStatus, user: any) {
    const booking = await this.findOne(id, user);

    const isOwner = booking.userId === user.id;
    const isHotelManager =
      user.role === Role.HOTEL_MANAGER && booking.hotel.managerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isAdmin && !isHotelManager && !isOwner) {
      throw new ForbiddenException('Permission denied.');
    }

    if (user.role === Role.USER && status !== BookingStatus.CANCELLED) {
      throw new BadRequestException('Users can only cancel their bookings.');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status },
      include: { hotel: true, room: true },
    });
  }
}
