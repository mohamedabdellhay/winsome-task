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

  async create(createBookingDto: CreateBookingDto, userId: string) {
    const { hotelId, roomId, checkIn, checkOut, guestCount } = createBookingDto;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Validate dates
    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-in date must be before check-out date.');
    }

    if (checkInDate < today) {
      throw new BadRequestException('Check-in date cannot be in the past.');
    }

    // 2. Get room details
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room || room.hotelId !== hotelId) {
      throw new NotFoundException('Room not found in the specified hotel.');
    }

    if (guestCount > room.capacity) {
      throw new BadRequestException(`Room capacity exceeded. Maximum ${room.capacity} guests allowed.`);
    }

    // 3. Check availability
    // Overlap condition: (existing.checkIn < new.checkOut) AND (existing.checkOut > new.checkIn)
    const overlappingBookings = await this.prisma.booking.count({
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

    // 4. Calculate price
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = Number(room.pricePerNight) * diffDays;

    // 5. Create booking
    return this.prisma.booking.create({
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
  }

  async findAll(user: any) {
    if (user.role === Role.ADMIN) {
      return this.prisma.booking.findMany({
        include: { hotel: true, room: true, user: true },
      });
    }

    if (user.role === Role.HOTEL_MANAGER) {
      return this.prisma.booking.findMany({
        where: { hotel: { managerId: user.id } },
        include: { hotel: true, room: true, user: true },
      });
    }

    return this.prisma.booking.findMany({
      where: { userId: user.id },
      include: { hotel: true, room: true },
    });
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

    // Permission check
    const isOwner = booking.userId === user.id;
    const isHotelManager = user.role === Role.HOTEL_MANAGER && booking.hotel.managerId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isAdmin && !isHotelManager && !isOwner) {
      throw new ForbiddenException('Permission denied.');
    }

    // Business logic: Users can only cancel
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
