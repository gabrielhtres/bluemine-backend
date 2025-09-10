import {
  Controller,
  Get,
  Param,
  UseGuards,
  Post,
  Body,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { User } from './user.model';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('user')
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @ApiExcludeEndpoint()
  @Post()
  create(@Body() data: CreateUserDto): Promise<User> {
    throw new NotFoundException(
      'Para registrar um novo usuário, utilize o endpoint /auth/register',
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('by-role/:role')
  @ApiOperation({ summary: 'Busca usuários por um papel (role) específico' })
  @ApiParam({
    name: 'role',
    enum: ['admin', 'manager', 'developer'],
    description: 'O papel a ser filtrado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
    type: [User],
  })
  findByRole(
    @Param('role') role: 'admin' | 'manager' | 'developer',
  ): Promise<User[]> {
    return this.userService.findByRole(role);
  }

  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
    type: [User],
  })
  findAll(): Promise<User[]> {
    return super.findAll();
  }

  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário retornado com sucesso.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id') id: string): Promise<User> {
    return super.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um usuário existente' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  update(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<User> {
    return super.update(id, data);
  }

  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id') id: string): Promise<void> {
    return super.remove(id);
  }
}
