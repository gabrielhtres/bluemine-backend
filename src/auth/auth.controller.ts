import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import type { Request } from 'express';
import { User } from 'src/user/user.model';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user as User);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.logout(user.id);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
