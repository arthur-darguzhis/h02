import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
