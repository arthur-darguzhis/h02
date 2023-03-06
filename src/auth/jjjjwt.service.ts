import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { UserDocument } from '../users/users-schema';
import * as process from 'process';
import { v4 as uuidv4 } from 'uuid';
import { InvalidValueException } from '../common/exceptions/domain.exceptions/invalid-value-exception';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';

@Injectable()
//TODO удалить, сейчас используется сервис из родного для nest jwt-module
export class JjjjwtService {
  private authSecret = process.env.JWT_SECRET;
  private refreshSecret = process.env.JWT_REFRESH_SECRET;

  generateAuthToken(user: UserDocument) {
    return jwt.sign({ userId: user._id.toString() }, this.authSecret, {
      expiresIn: '10m',
    });
  }

  generateRefreshToken(
    user: UserDocument,
    deviceId: string = uuidv4(),
  ): string {
    return jwt.sign(
      { userId: user._id, deviceId: deviceId },
      this.refreshSecret,
      { expiresIn: '14d' },
    );
  }

  verifyAuthJWT(token: string) {
    try {
      return jwt.verify(token, this.authSecret);
    } catch (err) {
      throw new InvalidValueException('auth JWT is invalid');
    }
  }

  verifyRefreshJWT(token: string) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (err) {
      throw new InvalidValueException('refresh JWT is invalid');
    }
  }

  getUserIdFromAccessToken(token: string) {
    try {
      const jwtPayload: any = jwt.verify(token, this.authSecret);
      return jwtPayload.userId;
    } catch (error) {
      return null;
    }
  }

  decodeRefreshJWT(token: string) {
    const jwtPayload = jwt.decode(token, { json: true });
    if (!jwtPayload) {
      throw new UnprocessableEntityException('JWT is invalid');
    }
    return jwtPayload;
  }

  getDeviceIdFromRefreshToken(token: string): string {
    const decodedToken = this.decodeRefreshJWT(token);
    return decodedToken?.deviceId;
  }

  getUserIdFromRefreshToken(token: string): string {
    const decodedToken = this.decodeRefreshJWT(token);
    return decodedToken?.userId;
  }
}
