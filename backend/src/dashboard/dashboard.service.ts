import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, Role } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: any) {
    const isManager = user.role === Role.HOTEL_MANAGER;
    const hotelFilter = isManager ? { hotelId: user.managedHotel?.id || 'none' } : {};
    
    // For managers, we don't count total hotels (always 1 or 0)
    const [
      totalHotels,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      revenueResult,
    ] = await Promise.all([
      isManager ? Promise.resolve(1) : this.prisma.hotel.count(),
      this.prisma.booking.count({ where: hotelFilter }),
      this.prisma.booking.count({ where: { ...hotelFilter, status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { ...hotelFilter, status: BookingStatus.PENDING } }),
      this.prisma.booking.aggregate({
        where: { ...hotelFilter, status: BookingStatus.CONFIRMED },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    return {
      totalHotels: isManager ? (user.managedHotel ? 1 : 0) : totalHotels,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalRevenue: revenueResult._sum.totalPrice ? Number(revenueResult._sum.totalPrice) : 0,
    };
  }
}
