import { IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoomDto {
  @ApiProperty({ required: false })
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  pricePerNight?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  availableCount?: number;
}
