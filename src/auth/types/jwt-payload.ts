export type UserRole = 'admin' | 'manager' | 'developer';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload extends JwtPayload {
  refreshToken: string;
}
