import { IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    example: 'Deluxe Suite',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: 2,
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({
    example: 100.0,
  })
  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @ApiProperty({
    example: 10,
  })
  @IsInt()
  @Min(0)
  availableCount: number;

  @ApiProperty({
    example: 'hotel-id-123',
  })
  @IsString()
  hotelId: string;
}