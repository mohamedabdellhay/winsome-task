import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHotelDto {
  @ApiProperty({ example: 'Four Seasons Hotel' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Riyadh' })
  @IsString()
  city: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiProperty({
    required: false,
    example: 'uuid-v4-string',
    description: 'Manager ID (auto-assigned if not provided)',
  })
  @IsString()
  managerId: string;
}

