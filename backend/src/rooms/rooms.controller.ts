import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiOperation({ summary: 'Create a new room (Admin or Hotel Manager)' })
  create(@Body() createRoomDto: CreateRoomDto, @GetUser() user: any) {
    return this.roomsService.create(createRoomDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiQuery({ name: 'hotelId', required: false })
  findAll(@Query('hotelId') hotelId?: string) {
    return this.roomsService.findAll(hotelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiOperation({ summary: 'Update a room (Admin or Hotel Manager)' })
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @GetUser() user: any,
  ) {
    return this.roomsService.update(id, updateRoomDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiOperation({ summary: 'Delete a room (Admin or Hotel Manager)' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.roomsService.remove(id, user);
  }
}
