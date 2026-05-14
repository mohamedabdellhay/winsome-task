import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { Role } from "@prisma/client";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
