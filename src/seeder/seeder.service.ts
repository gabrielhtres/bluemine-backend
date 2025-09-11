import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    console.log('Iniciando o processo de seeding do banco de dados...');
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    const adminName = this.configService.get<string>('ADMIN_NAME');

    if (!adminEmail || !adminPassword || !adminName) {
      console.error(
        'Credenciais do admin não definidas no .env. Pulei o seeding do admin.',
      );
      return;
    }

    const adminExists = await this.userService.findOneByEmail(adminEmail);

    if (adminExists) {
      console.log('Usuário admin já existe. Seeding não necessário.');
      return;
    }

    const adminUser: CreateUserDto = {
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    };

    try {
      await this.userService.create(adminUser);
      console.log('Usuário admin criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar o usuário admin:', error);
    }
  }
}
