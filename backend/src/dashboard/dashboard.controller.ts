import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.ADMIN, Role.HOTEL_MANAGER)
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Retrieves total counts for hotels, bookings, and revenue. Hotel Managers see stats for their own hotel only.',
  })
  @ApiOkResponse({
    description: 'Statistics retrieved successfully.',
    schema: {
      example: {
        totalHotels: 10,
        totalBookings: 150,
        confirmedBookings: 120,
        pendingBookings: 20,
        totalRevenue: 45000.5,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Forbidden. Requires Admin or Hotel Manager role.' })
  @ApiInternalServerErrorResponse({ description: 'Failed to fetch dashboard statistics.' })
  getStats(@GetUser() user: any) {
    return this.dashboardService.getStats(user);
  }
}
