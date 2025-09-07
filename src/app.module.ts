import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/user.model';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { ProjectMemberModule } from './project-member/project-member.module';
import { Project } from './project/project.model';
import { Task } from './task/task.model';
import { ProjectMember } from './project-member/project-member.model';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        models: [User, Project, Task, ProjectMember],
        autoLoadModels: true,
        synchronize: true,
        logging: true,
      }),
    }),

    AuthModule,
    UserModule,
    ProjectModule,
    TaskModule,
    ProjectMemberModule,
  ],
})
export class AppModule {}
