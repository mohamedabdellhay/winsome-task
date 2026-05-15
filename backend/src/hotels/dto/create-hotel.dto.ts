import { IsString, IsInt, IsOptional, IsEnum, IsUUID, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HotelStatus } from '@prisma/client';

export class CreateHotelDto {
  @ApiProperty({
    description: 'The name of the hotel',
    example: 'Four Seasons Hotel',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The city where the hotel is located',
    example: 'Riyadh',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'The full address of the hotel',
    example: '123 Main St, Al Olaya',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Star rating of the hotel (1 to 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiProperty({
    example: '44176aae-3143-426c-b0a2-34e9fca2e681',
    description: 'The ID of the hotel manager assigned to this hotel.',
  })
  @IsUUID('4', { message: 'Manager ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Manager ID is required' })
  managerId: string;

  @ApiProperty({
    required: false,
    enum: HotelStatus,
    example: HotelStatus.ACTIVE,
    description: 'Hotel status (Active or Inactive)',
  })
  @IsOptional()
  @IsEnum(HotelStatus, { message: 'Status must be ACTIVE or INACTIVE' })
  status?: HotelStatus;
}

