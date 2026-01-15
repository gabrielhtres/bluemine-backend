import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { Request } from 'express';
import type { UserRole } from '../types/jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    const role =
      user && typeof user === 'object'
        ? ((user as { role?: unknown }).role as UserRole | undefined)
        : undefined;

    if (!role) {
      throw new ForbiddenException(
        'Acesso negado. Nenhuma permissão de usuário encontrada.',
      );
    }

    // Admin tem acesso a todas as rotas que manager tem acesso
    const effectiveRoles = [...requiredRoles];
    if (requiredRoles.includes('manager') && !requiredRoles.includes('admin')) {
      effectiveRoles.push('admin');
    }

    const hasRequiredRole = effectiveRoles.includes(role);

    if (hasRequiredRole) {
      return true;
    }

    throw new ForbiddenException(
      'Você não tem permissão para acessar este recurso.',
    );
  }
}
