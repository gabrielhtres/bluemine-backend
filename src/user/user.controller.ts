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
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles, UseInterceptors } from '@nestjs/common';
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
  ApiConsumes,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { avatarUrlAnyFilesMulterOptions } from 'src/common/upload/avatar-upload';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

type UploadedAvatarFile = { fieldname?: string; filename?: string };

@ApiBearerAuth()
@ApiTags('Users')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Post()
  @ApiExcludeEndpoint()
  create(
    @Body() _data: Partial<User>,
    @CurrentUser('id') _managerId?: string,
  ): Promise<User> {
    void _data;
    void _managerId;
    throw new NotFoundException(
      'Para registrar um novo usuário, utilize o endpoint /auth/register',
    );
  }

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

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
    type: [User],
  })
  findAll(): Promise<User[]> {
    return super.findAll();
  }

  @Get(':id')
  @Roles('admin')
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

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza um usuário existente' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @UseInterceptors(AnyFilesInterceptor(avatarUrlAnyFilesMulterOptions))
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @UploadedFiles() files?: UploadedAvatarFile[],
  ): Promise<User> {
    const avatar = Array.isArray(files)
      ? files.find((f) => f?.fieldname === 'avatarUrl')
      : undefined;

    // Prioridade: arquivo avatar > body.avatarUrl (string)
    // Importante: se NENHUM dos dois for enviado, não altera o avatar existente.
    const avatarUrlFromFile = avatar?.filename
      ? `/uploads/avatars/${avatar.filename}`
      : undefined;

    const hasAvatarUrlInBody = Object.hasOwn(data, 'avatarUrl');
    const rawBodyAvatarUrl =
      typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined;
    const normalizedBodyAvatarUrl =
      rawBodyAvatarUrl !== undefined ? rawBodyAvatarUrl.trim() : undefined;

    const shouldSetAvatarUrl = !!avatarUrlFromFile || hasAvatarUrlInBody;

    const avatarUrl: string | null =
      avatarUrlFromFile ??
      (!normalizedBodyAvatarUrl ||
      normalizedBodyAvatarUrl.toLowerCase() === 'null'
        ? null
        : normalizedBodyAvatarUrl);

    return this.userService.updateWithSecurity(+id, {
      ...data,
      ...(shouldSetAvatarUrl ? { avatarUrl } : {}),
    });
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id') id: string): Promise<void> {
    return super.remove(id);
  }
}
