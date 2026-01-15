import type { UserRole } from 'src/auth/types/jwt-payload';

/**
 * Verifica se o usuário tem role de admin
 */
export function isAdmin(userRole?: string): boolean {
  return userRole === 'admin';
}

/**
 * Verifica se o usuário é manager ou admin
 */
export function isManagerOrAdmin(userRole?: string): boolean {
  return userRole === 'manager' || userRole === 'admin';
}

/**
 * Verifica se o usuário tem acesso baseado em role
 */
export function hasRole(
  userRole: string | undefined,
  allowedRoles: UserRole[],
): boolean {
  if (!userRole) {
    return false;
  }
  return allowedRoles.includes(userRole as UserRole);
}
