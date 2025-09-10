import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'João da Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Endereço de e-mail único do usuário.',
    example: 'joao.silva@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (deve ter no mínimo 8 caracteres).',
    example: 'senhaForte123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Define o papel do usuário no sistema.',
    enum: ['admin', 'manager', 'developer'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['admin', 'manager', 'developer'])
  role?: 'admin' | 'manager' | 'developer';
}
