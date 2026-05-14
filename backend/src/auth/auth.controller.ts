import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email, username, and password',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    schema: {
      example: {
        user: {
          id: 'b115159a-6093-48ba-9cc2-4b769cde2ad1',
          email: 'mohaf5med@example.com',
          name: 'mohamed abdellhay',
          role: 'USER',
          createdAt: '2026-05-14T20:17:41.595Z',
          updatedAt: '2026-05-14T20:17:41.595Z',
        },
        message: 'User registered successfully',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBody({ type: RegisterDto })
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive a JWT' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzJlMTZkYi05Njk4LTQ5MzctYjZmMC1jN2I1MDMwYTQ2MmIiLCJlbWFpbCI6Im1vaGFmNW1lZEBleGF5bXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3ODc4OTk3OCwiZXhwIjoxNzc5Mzk0Nzc4fQ.LX1T06Vd7F1wvNhiTRb8q5hbbTHEct4qs',
      user: {
        id: 'b32e16db-9698-4937-b6f0-c7b5030a462b',
        email: 'mohaf5med@exaymple.com',
        name: 'mohamed abdellhay',
        role: 'USER',
        createdAt: '2026-05-14T20:18:57.215Z',
        updatedAt: '2026-05-14T20:18:57.215Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }


}
