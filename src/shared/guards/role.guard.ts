import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enums/index.js';
import { BffErrorCodes } from '../errors/bff-error-codes.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => (target: any, key?: any, descriptor?: any) => {
  Reflect.defineMetadata(ROLES_KEY, roles, descriptor?.value ?? target);
  return descriptor ?? target;
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // T006, T040: Enforce role-based access per endpoint
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<RoleEnum[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const userRole: RoleEnum = request.headers['x-user-role'] as RoleEnum;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new HttpException(
        { code: BffErrorCodes.UNAUTHORIZED, message: 'Rol insuficiente para esta operación' },
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
