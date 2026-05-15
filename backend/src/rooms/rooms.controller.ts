import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ForbiddenException, HttpCode, HttpStatus } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiForbiddenResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiOperation({ 
    summary: 'Add a new room', 
    description: 'Allows an administrator or a hotel manager to add a new room to a hotel. Hotel Managers can only add rooms to their assigned hotel.' 
  })
  @ApiBody({ type: CreateRoomDto })
  @ApiCreatedResponse({ description: 'The room has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid input.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires Admin or Hotel Manager role.' })
  @ApiInternalServerErrorResponse({ description: 'Failed to create room.' })
  create(@Body() createRoomDto: CreateRoomDto, @GetUser() user: any) {
    if (user.role === Role.HOTEL_MANAGER) {
      if (!user.managedHotel) {
        throw new ForbiddenException('You must be assigned to a hotel to create rooms.');
      }
      createRoomDto.hotelId = user.managedHotel.id;
    }
    return this.roomsService.create(createRoomDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'View rooms',
    description: 'Retrieves a list of rooms. Hotel Managers can only view rooms belonging to their assigned hotel. Administrators can view all rooms or filter by hotelId.',
  })
  @ApiQuery({ name: 'hotelId', required: false, type: String, description: 'Filter rooms by hotel ID (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 10 })
  @ApiOkResponse({
    description: 'List of rooms retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: '64b842c5-e0a6-46bb-b73f-41e1f9928527',
            type: 'Single Room',
            capacity: 1,
            pricePerNight: 130,
            availableCount: 1,
            createdAt: '2026-05-14T22:57:54.453Z',
            updatedAt: '2026-05-14T23:01:19.295Z',
            hotelId: '5685125c-130e-418c-8c40-1433d41e8e38',
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Failed to fetch rooms.' })
  findAll(
    @Query('hotelId') hotelId: string | undefined, 
    @Query('page') page: string | undefined, 
    @Query('limit') limit: string | undefined, 
    @GetUser() user: any
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    if (user.role === Role.HOTEL_MANAGER) {
      if (!user.managedHotel) {
        return { data: [], meta: { total: 0, page: pageNumber, limit: limitNumber, totalPages: 1 } };
      }
      return this.roomsService.findAll(user.managedHotel.id, pageNumber, limitNumber);
    }
    return this.roomsService.findAll(hotelId, pageNumber, limitNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID', description: 'Retrieves detailed information about a specific room.' })
  @ApiOkResponse({
    description: 'The room details have been successfully retrieved.',
    schema: {
      example: {
        id: '64b842c5-e0a6-46bb-b73f-41e1f9928527',
        type: 'Single Room',
        capacity: 1,
        pricePerNight: 130,
        availableCount: 1,
        createdAt: '2026-05-14T22:57:54.453Z',
        updatedAt: '2026-05-14T23:01:19.295Z',
        hotelId: '5685125c-130e-418c-8c40-1433d41e8e38',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Room not found.' })
  @ApiInternalServerErrorResponse({ description: 'Failed to fetch room details.' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiOperation({ 
    summary: 'Update a room', 
    description: 'Allows an administrator or a hotel manager to update room information. **Note for Hotel Managers:** You are only permitted to update the price and availability of rooms in your assigned hotel.' 
  })
  @ApiBody({ type: UpdateRoomDto })
  @ApiOkResponse({ description: 'The room has been successfully updated.' })
  @ApiBadRequestResponse({ description: 'Invalid input.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires Admin or Hotel Manager role.' })
  @ApiNotFoundResponse({ description: 'Room not found.' })
  @ApiInternalServerErrorResponse({ description: 'Failed to update room.' })
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @GetUser() user: any,
  ) {
    if (user.role === Role.HOTEL_MANAGER) {
      // Hotel Managers can only edit price and availability
      const filteredDto: UpdateRoomDto = {};
      if (updateRoomDto.pricePerNight !== undefined) filteredDto.pricePerNight = updateRoomDto.pricePerNight;
      if (updateRoomDto.availableCount !== undefined) filteredDto.availableCount = updateRoomDto.availableCount;
      return this.roomsService.update(id, filteredDto, user);
    }
    return this.roomsService.update(id, updateRoomDto, user);
  }

}
