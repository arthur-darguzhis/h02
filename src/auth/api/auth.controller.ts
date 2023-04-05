import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  Headers,
  Ip,
} from '@nestjs/common';
import { AuthService } from '../infrastructure/auth.service';
import { PasswordRecoveryDto } from './dto/passwordRecovery.dto';
import { SetNewPasswordDto } from './dto/setNewPassword.dto';
import { ResendRegistrationEmailDto } from './dto/resendRegistrationEmail.dto';
import { ConfirmRegistrationDto } from './dto/confirmRegistration.dto';
import { RegistrationDto } from './dto/registration.dto';
import { Response } from 'express';
import { LocalAuthGuard } from '../infrastructure/guards/local-auth.guard';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { CurrentUserId } from '../../global-services/decorators/current-user-id.decorator';
import { UsersQueryRepository } from '../../users/users.query.repository';
import { RefreshTokenPayload } from '../../global-services/decorators/get-refresh-token-from-cookie.decorator';
import { UserSessionsService } from '../../security/user-sessions.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RefreshTokenInCookieGuard } from '../infrastructure/guards/refresh-token-in-cookie';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegistrationCommand } from '../application/use-cases/registration.use-case';
import { ConfirmRegistrationCommand } from '../application/use-cases/registration-confirmation.use-case';
import { ResendRegistrationEmailCommand } from '../application/use-cases/resend-registration-email.use-case';
import { LoginCommand } from '../application/use-cases/login.use-case';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { LogoutCommand } from '../application/use-cases/logout.use-case';
import { CurrentUserInfoQuery } from '../application/query/current-user-info.query';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.use-case';
import { SetNewPasswordCommand } from '../application/use-cases/set-new-password.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
    private userSessionsService: UserSessionsService,
  ) {}

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: RegistrationDto) {
    await this.commandBus.execute(
      new RegistrationCommand(dto.login, dto.password, dto.email),
    );
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() dto: ConfirmRegistrationDto) {
    await this.commandBus.execute(new ConfirmRegistrationCommand(dto.code));
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(@Body() dto: ResendRegistrationEmailDto) {
    await this.commandBus.execute(
      new ResendRegistrationEmailCommand(dto.email),
    );
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  async login(
    @Request() req,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { accessToken, refreshToken } = await this.commandBus.execute(
        new LoginCommand(req.user, ip, userAgent),
      );

      res.status(HttpStatus.OK).cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 20 * 1000, // 30 days in milliseconds
        // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      });
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenInCookieGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Request() req,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @RefreshTokenPayload()
    refreshTokenPayload: {
      userId: string;
      deviceId: string;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand(refreshTokenPayload, ip, userAgent),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 20 * 1000, // 30 days in milliseconds
      // maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });
    return { accessToken };
  }

  @Post('logout')
  @UseGuards(RefreshTokenInCookieGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @RefreshTokenPayload()
    refreshTokenPayload: {
      userId: string;
      deviceId: string;
    },
  ) {
    await this.commandBus.execute(
      new LogoutCommand(
        refreshTokenPayload.deviceId,
        refreshTokenPayload.userId,
      ),
    );
    res.clearCookie('refreshToken');
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async requestPasswordRecovery(@Body() dto: PasswordRecoveryDto) {
    try {
      await this.commandBus.execute(new PasswordRecoveryCommand(dto.email));
    } catch (err) {
      console.log("silent exception for prevent user's email detection");
    }
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(@Body() dto: SetNewPasswordDto) {
    await this.commandBus.execute(
      new SetNewPasswordCommand(dto.newPassword, dto.recoveryCode),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getInfoAboutLoggedInUser(@CurrentUserId() currentUserId) {
    return await this.queryBus.execute(new CurrentUserInfoQuery(currentUserId));
  }
}
