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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('hotels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new hotel (Admin only)' })
  @ApiBody({
    type: CreateHotelDto,
    examples: {
      example1: {
        summary: 'Example hotel',
        value: {
          name: 'Four Seasons Hotel',
          city: 'Riyadh',
          address: '123 Main St',
          stars: 5,
          managerId: 'uuid-v4-string',
        },
      },
    },
  })
  async create(@Body() createHotelDto: CreateHotelDto) {
    try {
      return await this.hotelsService.create(createHotelDto);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('This manager is already assigned to a hotel.');
      }
      throw new InternalServerErrorException('Failed to create hotel.');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all hotels (with optional search and pagination)' })
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
  @ApiOperation({ summary: 'Get a hotel by ID' })
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
  @ApiOperation({ summary: 'Update a hotel (Admin only)' })
  async update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    try {
      return await this.hotelsService.update(id, updateHotelDto);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('This manager is already assigned to another hotel.');
      }
      throw new InternalServerErrorException('Failed to update hotel.');
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hotel (Admin only)' })
  async remove(@Param('id') id: string) {
    try {
      await this.hotelsService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete hotel due to associated records or an unexpected error.');
    }
  }
}
