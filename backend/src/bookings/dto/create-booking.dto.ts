import { IsString, IsInt, IsDateString, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'The ID of the hotel to book',
    example: '5685125c-130e-418c-8c40-1433d41e8e38',
  })
  @IsUUID()
  hotelId: string;

  @ApiProperty({
    description: 'The ID of the room to book',
    example: '64b842c5-e0a6-46bb-b73f-41e1f9928527',
  })
  @IsUUID()
  roomId: string;

  @ApiProperty({
    description: 'The check-in date',
    example: '2026-06-01',
  })
  @IsDateString()
  checkIn: string;

  @ApiProperty({
    description: 'The check-out date',
    example: '2026-06-05',
  })
  @IsDateString()
  checkOut: string;

  @ApiProperty({
    description: 'Number of guests',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  guestCount: number;
}
