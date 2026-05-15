import { IsString, IsInt, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoomDto {
  @ApiProperty({
    description: 'The type or category of the room',
    example: 'Deluxe Suite',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'The maximum number of occupants for the room',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({
    description: 'The price per night for the room (Editable by Hotel Managers)',
    example: 100.0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerNight?: number;

  @ApiProperty({
    description: 'The total number of rooms of this type available in the hotel (Editable by Hotel Managers)',
    example: 10,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  availableCount?: number;
}
