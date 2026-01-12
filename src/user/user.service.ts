import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectModel(User) private readonly userModel: typeof User) {
    super(userModel);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 12;

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    console.log('vtnc', hashedPassword)

    return super.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findByRole(role: 'admin' | 'manager' | 'developer'): Promise<User[]> {
    return this.userModel.findAll({ where: { role } });
  }
}
