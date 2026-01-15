import { NotFoundException } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';

export class BaseService<T extends Model<any, any>> {
  constructor(protected readonly model: ModelCtor<T>) {}

  async create(data: unknown): Promise<T> {
    return this.model.create(data as T['_creationAttributes']);
  }

  async findAll(): Promise<T[]> {
    return this.model.findAll();
  }

  async findOne(id: number): Promise<T> {
    const record = await this.model.findByPk(id);
    if (!record) throw new NotFoundException(`${this.model.name} not found`);
    return record;
  }

  async update(id: number, data: unknown): Promise<T> {
    const record = await this.findOne(id);
    return record.update(data as Partial<T['_attributes']>);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await record.destroy();
  }
}
