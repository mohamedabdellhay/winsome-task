import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingStatusDto {
  @ApiProperty({
    description: 'The new status of the booking',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
