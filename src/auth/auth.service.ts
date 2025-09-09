import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/models';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { RolePermissions } from './roles';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(user: User) {
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      permissions: user.role ? RolePermissions[user.role] : [],
    };
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.userService.create({
      name,
      email,
      password: hashedPassword,
    });

    const { password: _, ...result } = user.get({ plain: true });
    return result;
  }

  async logout(userId: number) {
    return this.userService.update(userId, { currentHashedRefreshToken: null });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.currentHashedRefreshToken) {
      throw new ForbiddenException('Acesso Negado');
    }

    const tokensMatch = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (!tokensMatch) throw new ForbiddenException('Acesso Negado');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      permissions: user.role ? RolePermissions[user.role] : [],
    };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.userService.update(userId, {
      currentHashedRefreshToken: hashedRefreshToken,
    });
  }

  private async getTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION_TIME',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
