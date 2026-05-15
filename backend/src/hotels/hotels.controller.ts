import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('hotels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new hotel', description: 'Allows an administrator to create a new hotel. Only one hotel can be assigned per manager.' })
  @ApiBody({ type: CreateHotelDto })
  @ApiCreatedResponse({ description: 'The hotel has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid input or manager already assigned to another hotel.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires Admin role.' })
  @ApiInternalServerErrorResponse({ description: 'Failed to create hotel.' })
  async create(@Body() createHotelDto: CreateHotelDto) {
    try {
      return await this.hotelsService.create(createHotelDto);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'This manager is already assigned to a hotel.',
        );
      }
      throw new InternalServerErrorException('Failed to create hotel.');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all hotels',
    description: 'Retrieves a list of all hotels with optional search filtering and pagination.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter hotels by name or city',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 10 })
  @ApiOkResponse({
    description: 'List of hotels retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: '5685125c-130e-418c-8c40-1433d41e8e38',
            name: 'Four Seasons Hotel',
            city: 'Riyadh',
            address: '123 Main St',
            stars: 5,
            status: 'ACTIVE',
            createdAt: '2026-05-14T22:41:20.539Z',
            updatedAt: '2026-05-14T22:47:31.924Z',
            managerId: '44176aae-3143-426c-b0a2-34e9fca2e681',
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
  @ApiInternalServerErrorResponse({ description: 'Failed to fetch hotels.' })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNumber = page ? parseInt(page, 10) : 1;
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      return await this.hotelsService.findAll(search, pageNumber, limitNumber);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch hotels.');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotel by ID', description: 'Retrieves detailed information about a specific hotel, including its rooms and manager details.' })
  @ApiOkResponse({
    description: 'The hotel details have been successfully retrieved.',
    schema: {
      example: {
        id: '5685125c-130e-418c-8c40-1433d41e8e38',
        name: 'Four Seasons Hotel',
        city: 'Riyadh',
        address: '123 Main St',
        stars: 5,
        status: 'ACTIVE',
        createdAt: '2026-05-14T22:41:20.539Z',
        updatedAt: '2026-05-14T22:47:31.924Z',
        managerId: '44176aae-3143-426c-b0a2-34e9fca2e681',
        rooms: [
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
        manager: {
          id: '44176aae-3143-426c-b0a2-34e9fca2e681',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Hotel not found.' })
  @ApiInternalServerErrorResponse({ description: 'Failed to fetch hotel details.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.hotelsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch hotel details.');
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a hotel', description: 'Allows an administrator to update hotel information.' })
  @ApiBody({ type: UpdateHotelDto })
  @ApiOkResponse({ description: 'The hotel has been successfully updated.' })
  @ApiBadRequestResponse({ description: 'Invalid input or manager already assigned to another hotel.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires Admin role.' })
  @ApiNotFoundResponse({ description: 'Hotel not found.' })
  @ApiInternalServerErrorResponse({ description: 'Failed to update hotel.' })
  async update(
    @Param('id') id: string,
    @Body() updateHotelDto: UpdateHotelDto,
  ) {
    try {
      return await this.hotelsService.update(id, updateHotelDto);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'This manager is already assigned to another hotel.',
        );
      }
      throw new InternalServerErrorException('Failed to update hotel.');
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hotel', description: 'Allows an administrator to delete a hotel. This will fail if there are associated records that prevent deletion.' })
  @ApiNoContentResponse({ description: 'The hotel has been successfully deleted.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires Admin role.' })
  @ApiNotFoundResponse({ description: 'Hotel not found.' })
  @ApiInternalServerErrorResponse({ description: 'Failed to delete hotel.' })
  async remove(@Param('id') id: string) {
    try {
      await this.hotelsService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete hotel due to associated records or an unexpected error.',
      );
    }
  }
}
