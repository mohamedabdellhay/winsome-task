import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateHotelDto {
  @ApiProperty({
    description: 'The name of the hotel',
    example: 'Four Seasons Hotel',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The city where the hotel is located',
    example: 'Riyadh',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'The full address of the hotel',
    example: '123 Main St, Al Olaya',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Star rating of the hotel (1 to 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  stars?: number;

  @ApiProperty({
    required: false,
    example: '44176aae-3143-426c-b0a2-34e9fca2e681',
    description: 'The ID of the manager assigned to this hotel.',
  })
  @IsOptional()
  @IsString()
  managerId?: string;
}
