import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { JwtPayloadType } from '../../utils/types';
import { CURRENT_USER_KEY } from '../../utils/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token || type !== 'Bearer') {
      throw new UnauthorizedException('Access Denied, No Token Provided');
    }

    try {
      const payload: JwtPayloadType = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      request[CURRENT_USER_KEY] = payload;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }

      throw new UnauthorizedException('Access Denied, Invalid Token');
    }
  }
}
