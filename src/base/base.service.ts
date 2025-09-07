import { NotFoundException } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';

export class BaseService<T extends Model> {
  constructor(protected readonly model: ModelCtor<T>) {}

  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async findAll(): Promise<T[]> {
    return this.model.findAll();
  }

  async findOne(id: number): Promise<T> {
    const record = await this.model.findByPk(id);
    if (!record) throw new NotFoundException(`${this.model.name} not found`);
    return record;
  }

  async update(id: number, data: any): Promise<T> {
    const record = await this.findOne(id);
    return record.update(data);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await record.destroy();
  }
}
