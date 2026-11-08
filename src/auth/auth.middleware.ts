import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BffErrorCodes } from '../shared/errors/bff-error-codes.js';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  // T004, T010: Validate session token from header
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
      throw new HttpException(
        { code: BffErrorCodes.UNAUTHORIZED, message: 'Sesión inválida o expirada' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    next();
  }
}
