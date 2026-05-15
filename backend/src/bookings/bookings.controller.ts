import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new booking',
    description: 'Allows a user to book a room. Validates availability and calculates total price.',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiCreatedResponse({ description: 'Booking created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid input or room not available.' })
  @ApiInternalServerErrorResponse({ description: 'Server error.' })
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: any) {
    return this.bookingsService.create(createBookingDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieves all bookings for the authenticated user. Admins can see all bookings.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: 'List of bookings retrieved successfully.' })
  findAll(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.bookingsService.findAll(user, pageNumber, limitNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiOkResponse({ description: 'Booking details retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  @ApiForbiddenResponse({ description: 'Permission denied.' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.bookingsService.findOne(id, user);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update booking status',
    description: 'Allows updating the status of a booking (Confirmed, Cancelled). Users can only cancel.',
  })
  @ApiBody({ type: UpdateBookingStatusDto })
  @ApiOkResponse({ description: 'Booking status updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid status transition.' })
  @ApiNotFoundResponse({ description: 'Booking not found.' })
  @ApiForbiddenResponse({ description: 'Permission denied.' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
    @GetUser() user: any,
  ) {
    return this.bookingsService.updateStatus(id, updateBookingStatusDto.status, user);
  }
}
