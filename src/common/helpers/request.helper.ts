import type { Request } from 'express';
import { ForbiddenException } from '@nestjs/common';

export interface AuthenticatedUser {
  id: number;
  role: string;
}

/**
 * Extrai informações do usuário autenticado do request
 * @throws ForbiddenException se o request ou usuário não estiverem disponíveis
 */
export function extractUserFromRequest(req?: Request): AuthenticatedUser {
  if (!req) {
    throw new ForbiddenException('Request não disponível.');
  }

  const user = req.user as { id?: number; role?: string } | undefined;

  if (!user?.id || !user?.role) {
    throw new ForbiddenException(
      'Informações de usuário não disponíveis no request.',
    );
  }

  return {
    id: user.id,
    role: user.role,
  };
}
