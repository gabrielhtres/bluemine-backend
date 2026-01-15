import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {
    super(userModel);
  }

  private readonly publicAttributes = [
    'id',
    'name',
    'email',
    'role',
    'avatarUrl',
  ] as const;

  async findAll(): Promise<User[]> {
    return this.userModel.findAll({ attributes: [...this.publicAttributes] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: [...this.publicAttributes],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async create(
    createUserDto: CreateUserDto & { avatarUrl?: string | null },
  ): Promise<User> {
    const saltRounds = 12;

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    return super.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async updateWithSecurity(
    id: number,
    data: Partial<
      Omit<CreateUserDto, 'avatarUrl'> & { avatarUrl?: string | null }
    >,
  ): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const oldAvatarUrl = user.avatarUrl;
    const updateData: Partial<
      Omit<CreateUserDto, 'avatarUrl'> & { avatarUrl?: string | null }
    > = { ...data };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    // Se avatarUrl foi enviado (string ou null), e houver avatar antigo, remove o arquivo antigo.
    if (Object.prototype.hasOwnProperty.call(updateData, 'avatarUrl')) {
      const nextAvatarUrl = updateData.avatarUrl;
      const shouldRemoveOld =
        !!oldAvatarUrl &&
        (nextAvatarUrl === null || nextAvatarUrl !== oldAvatarUrl);

      if (shouldRemoveOld) {
        // oldAvatarUrl é algo como "/uploads/avatars/xxx.jpg"
        const relPath = String(oldAvatarUrl).replace(/^\/+/, ''); // "uploads/avatars/xxx.jpg"
        const filePath = join(process.cwd(), relPath);
        try {
          await fs.unlink(filePath);
        } catch {
          // Ignora se o arquivo não existir / não puder ser removido
        }
      }
    }

    await user.update(updateData);
    // Retorna apenas os campos públicos
    return this.findOne(id);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findByRole(role: 'admin' | 'manager' | 'developer'): Promise<User[]> {
    return this.userModel.findAll({
      where: { role },
      attributes: [...this.publicAttributes],
    });
  }
}
