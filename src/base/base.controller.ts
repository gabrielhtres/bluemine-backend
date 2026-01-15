import { Body, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BaseService } from './base.service';
import { Model } from 'sequelize-typescript';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
export class BaseController<T extends Model> {
  constructor(private readonly baseService: BaseService<T>) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Cria um novo registro' })
  @ApiResponse({
    status: 201,
    description: 'O registro foi criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  create(
    @Body() data: Partial<T>,
    @CurrentUser('id') managerId?: string,
  ): Promise<T> {
    void managerId;
    return this.baseService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Lista todos os registros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros retornada com sucesso.',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findAll(): Promise<T[]> {
    return this.baseService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Busca um registro pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do registro' })
  @ApiResponse({ status: 200, description: 'Registro retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  findOne(@Param('id') id: string): Promise<T> {
    return this.baseService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um registro existente' })
  @ApiParam({ name: 'id', description: 'ID do registro' })
  @ApiResponse({ status: 200, description: 'Registro atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  update(@Param('id') id: string, @Body() data: Partial<T>): Promise<T> {
    return this.baseService.update(+id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remove um registro' })
  @ApiParam({ name: 'id', description: 'ID do registro' })
  @ApiResponse({ status: 200, description: 'Registro removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Registro não encontrado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.baseService.remove(+id);
  }
}
