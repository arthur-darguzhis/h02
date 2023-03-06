import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordRecoveryDto } from './dto/passwordRecovery.dto';
import { SetNewPasswordDto } from './dto/setNewPassword.dto';
import { LoginDto } from './dto/login.dto';
import { ResendRegistrationEmailDto } from './dto/resendRegistrationEmail.dto';
import { ConfirmRegistrationDto } from './dto/confirmRegistration.dto';
import { RegistrationDto } from './dto/registration.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: RegistrationDto) {
    return this.authService.registration(dto);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() dto: ConfirmRegistrationDto) {
    return this.authService.confirmRegistration(dto);
  }

  @Post('registration-email-resending')
  async resendRegistrationEmail(@Body() dto: ResendRegistrationEmailDto) {
    return this.authService.resendRegistrationEmail(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    res
      .status(HttpStatus.OK)
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      })
      .json({ accessToken });
  }

  @Post('refresh-token')
  async refreshToken() {
    // return this.authService.refreshToken()
  }

  @Post('logout')
  async logout() {
    // return this.authService.logout()
  }
  @Post('password-recovery')
  async requestPasswordRecovery(@Body() dto: PasswordRecoveryDto) {
    // return this.authService.requestPasswordRecovery(dto);
  }

  @Post('new-password')
  async setNewPassword(@Body() dto: SetNewPasswordDto) {
    // return this.authService.setNewPassword(dto);
  }

  @Get('me')
  async getInfoAboutLoggedInUser() {
    // return this.authService.getInfoAboutLoggedInUser();
  }
}
