import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { Model } from 'sequelize-typescript';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

export class BaseController<T extends Model> {
  constructor(private readonly baseService: BaseService<T>) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() data: T, @CurrentUser('id') managerId?: string): Promise<T> {
    return this.baseService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(): Promise<T[]> {
    return this.baseService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<T> {
    return this.baseService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: T): Promise<T> {
    return this.baseService.update(+id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.baseService.remove(+id);
  }
}
