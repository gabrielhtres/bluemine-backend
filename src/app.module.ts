import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/user.model';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { ProjectMemberModule } from './project-member/project-member.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Project } from './project/project.model';
import { Task } from './task/task.model';
import { ProjectMember } from './project-member/project-member.model';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExistsInDatabaseConstraint } from './common/validators/exists-in-database.validator';
import { SeederModule } from './seeder/seeder.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
      }),
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
    DashboardModule,
    SeederModule,
  ],
  providers: [AppService, ExistsInDatabaseConstraint],
})
export class AppModule {}
