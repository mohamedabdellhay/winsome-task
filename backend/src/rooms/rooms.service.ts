import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto, user: any) {
    await this.verifyManagerAccess(createRoomDto.hotelId, user);
    return this.prisma.room.create({
      data: createRoomDto,
    });
  }

  async findAll(hotelId?: string, page: number = 1, limit: number = 10) {
    const whereClause = hotelId ? { hotelId } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.room.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          hotel: true,
        },
      }),
      this.prisma.room.count({ where: whereClause })
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

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        hotel: true,
      },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto, user: any) {
    const room = await this.findOne(id);
    await this.verifyManagerAccess(room.hotelId, user);
    
    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }


  async verifyManagerAccess(hotelId: string, user: any) {
    if (user.role === Role.ADMIN) return true;
    
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    
    if (!hotel || hotel.managerId !== user.id) {
      throw new ForbiddenException('You do not have permission to manage rooms for this hotel');
    }
    return true;
  }
}
