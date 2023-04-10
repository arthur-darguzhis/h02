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
import { PasswordRecoveryDto } from './dto/passwordRecovery.dto';
import { SetNewPasswordDto } from './dto/setNewPassword.dto';
import { ResendRegistrationEmailDto } from './dto/resendRegistrationEmail.dto';
import { ConfirmRegistrationDto } from './dto/confirmRegistration.dto';
import { RegistrationDto } from './dto/registration.dto';
import { Response } from 'express';
import { LocalAuthGuard } from '../infrastructure/guards/local-auth.guard';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { CurrentUserId } from '../../global-services/decorators/current-user-id.decorator';
import { RefreshTokenPayload } from '../../global-services/decorators/get-refresh-token-from-cookie.decorator';
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
import { UnprocessableEntityException } from '../../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { ThrottlerBehindProxyGuard } from '../infrastructure/guards/throttler-behind-proxy.guard';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration';
import { AuthConfigService } from '../infrastructure/auth-config.service';
import { JwtRefreshTokenGuard } from '../infrastructure/guards/jwt-refrest-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private configService: ConfigService<ConfigType>,
    private authConfigService: AuthConfigService,
  ) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: RegistrationDto) {
    await this.commandBus.execute(
      new RegistrationCommand(dto.login, dto.password, dto.email),
    );
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() dto: ConfirmRegistrationDto) {
    try {
      await this.commandBus.execute(new ConfirmRegistrationCommand(dto.code));
    } catch (e) {
      throw new UnprocessableEntityException(
        'The confirmation code is incorrect',
        'code',
      );
    }
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(@Body() dto: ResendRegistrationEmailDto) {
    await this.commandBus.execute(
      new ResendRegistrationEmailCommand(dto.email),
    );
  }

  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('login')
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
        maxAge: this.authConfigService.getCookieMaxAge,
      });
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Request() req,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand(req.user, ip, userAgent),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.authConfigService.getCookieMaxAge,
    });
    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtRefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.commandBus.execute(
      new LogoutCommand(req.user.deviceId, req.user.userId),
    );
    res.clearCookie('refreshToken');
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async requestPasswordRecovery(@Body() dto: PasswordRecoveryDto) {
    try {
      await this.commandBus.execute(new PasswordRecoveryCommand(dto.email));
    } catch (err) {
      console.log("silent exception for prevent user's email detection");
    }
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('new-password')
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
