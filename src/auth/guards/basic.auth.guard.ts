import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as process from 'process';

const BASIC_AUTH_PREFIX = 'Basic ';

export class BasicAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!request.headers.authorization) {
      throw new UnauthorizedException();
    }

    // if (!authHeader || !authHeader.startsWith(BASIC_AUTH_PREFIX)) {
    //   throw new UnauthorizedException();
    // }

    // const base64Credentials = authHeader.slice(BASIC_AUTH_PREFIX.length);
    // const decodedCredentials = Buffer.from(
    //   base64Credentials,
    //   'base64',
    // ).toString();
    // const [login, password] = decodedCredentials.split(':');
    //
    // const expectedCredentials = `${process.env.LOGIN_FOR_ADMIN_BASIC_AUTH}:${process.env.PASSWORD_FOR_ADMIN_BASIC_AUTH}`;
    // if (`${login}:${password}` !== expectedCredentials) {
    //   throw new UnauthorizedException();
    // }
    return true;
  }
}
