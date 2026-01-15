import type { User } from 'src/user/user.model';
import type { JwtRefreshPayload } from 'src/auth/types/jwt-payload';

declare global {
  namespace Express {
    interface Request {
      user?: User | JwtRefreshPayload;
    }
  }
}

export {};
