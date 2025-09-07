import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { User } from './user.model';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('user')
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('by-role/:role')
  findByRole(
    @Param('role') role: 'admin' | 'manager' | 'developer',
  ): Promise<User[]> {
    return this.userService.findByRole(role);
  }
}
