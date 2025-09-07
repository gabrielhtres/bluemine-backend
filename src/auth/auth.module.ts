import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/acess-token.strategy';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [ConfigModule, UserModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
