import { Injectable } from '@nestjs/common';
import { RoleEnum } from '../shared/enums/index.js';

@Injectable()
export class SessionService {
  // T010, T011: Extract role-aware session from request headers
  extractSession(headers: Record<string, any>): { userId: string; role: RoleEnum } {
    return {
      userId: headers['x-user-id'] as string,
      role: headers['x-user-role'] as RoleEnum,
    };
  }

  hasRole(role: RoleEnum, ...allowed: RoleEnum[]): boolean {
    return allowed.includes(role);
  }
}
