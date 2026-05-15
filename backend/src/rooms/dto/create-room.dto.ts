import { IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    description: 'The type or category of the room',
    example: 'Deluxe Suite',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'The maximum number of occupants for the room',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({
    description: 'The price per night for the room',
    example: 100.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @ApiProperty({
    description: 'The total number of rooms of this type available in the hotel',
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  availableCount: number;

  @ApiProperty({
    description: 'The ID of the hotel this room belongs to',
    example: '5685125c-130e-418c-8c40-1433d41e8e38',
  })
  @IsString()
  hotelId: string;
}