import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import type { Request } from 'express';
import { User } from 'src/user/user.model';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { avatarUrlAnyFilesMulterOptions } from 'src/common/upload/avatar-upload';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Realiza o login do usuário e retorna tokens de acesso',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido. Retorna tokens e permissões.',
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Req() req: Request, @Body() _loginDto: LoginDto) {
    return this.authService.login(req.user as User);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário no sistema' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado (Conflict).' })
  @UseInterceptors(AnyFilesInterceptor(avatarUrlAnyFilesMulterOptions))
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFiles() files?: any[],
  ) {
    const avatar = Array.isArray(files)
      ? files.find((f) => f?.fieldname === 'avatarUrl')
      : undefined;
    const avatarUrlFromFile = avatar?.filename
      ? `/uploads/avatars/${avatar.filename}`
      : undefined;

    const avatarUrlFromBody =
      typeof createUserDto.avatarUrl === 'string' && createUserDto.avatarUrl.trim()
        ? createUserDto.avatarUrl.trim()
        : undefined;

    return this.authService.register(
      createUserDto,
      avatarUrlFromFile ?? avatarUrlFromBody,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Realiza o logout do usuário (invalida o refresh token)',
  })
  @ApiResponse({ status: 200, description: 'Logout bem-sucedido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  logout(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.logout(user.id);
  }

  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Gera um novo par de tokens (access e refresh) usando um refresh token válido',
  })
  @ApiResponse({ status: 200, description: 'Tokens atualizados com sucesso.' })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado ou refresh token inválido.',
  })
  refreshTokens(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
