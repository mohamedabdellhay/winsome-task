import { Injectable, NotFoundException } from '@nestjs/common';
import { HotelStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  async create(createHotelDto: CreateHotelDto) {
    return this.prisma.hotel.create({
      data: createHotelDto,
    });
  }

  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 10,
    activeOnly = false,
  ) {
    const whereClause: Prisma.HotelWhereInput = {};

    if (activeOnly) {
      whereClause.status = HotelStatus.ACTIVE;
    }

    if (search) {
      const terms = search.trim().split(/\s+/).filter(Boolean);

      whereClause.AND = terms.map((term) => ({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { city: { contains: term, mode: 'insensitive' } },
          { address: { contains: term, mode: 'insensitive' } },
        ],
      }));
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.hotel.count({ where: whereClause }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, activeOnly = false) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: {
        rooms: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    if (activeOnly && hotel.status !== HotelStatus.ACTIVE) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }
    return hotel;
  }

  async update(id: string, updateHotelDto: UpdateHotelDto) {
    await this.findOne(id);
    return this.prisma.hotel.update({
      where: { id },
      data: updateHotelDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.hotel.delete({
      where: { id },
    });
  }
}
