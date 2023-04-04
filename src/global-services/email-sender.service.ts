import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/smtp-transport';
import { UserDocument } from '../users/users-schema';
import { UnprocessableEntityException } from '../common/exceptions/domain.exceptions/unprocessable-entity.exception';
import { AppConfigService } from '../app-config.service';

//TODO может мейлер как то улучшить надо? может есть какой то по nestJs подход или модуль обертка?
@Injectable()
export class EmailSenderService {
  private transporter: nodemailer.Transporter;

  constructor(private appConfigService: AppConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.appConfigService.getGmailLogin,
        pass: this.appConfigService.getGmailPassword,
      },
    });
  }

  private async sendMail(preparedMail: MailOptions) {
    await this.transporter.sendMail(preparedMail);
  }

  public async sendRegistrationConfirmationEmail(
    email: string,
    confirmationCode: string,
  ) {
    const confirmUrl = `${this.appConfigService.getAppHost} 'confirm-registration?code=${confirmationCode}`;

    await this.sendMail({
      from: `"Artur Darguzhis" <${this.appConfigService.getGmailLogin}>`,
      to: email,
      subject: 'Thank for your registration',
      html: `<p>To finish registration please follow the link below:
                <a href="${confirmUrl}">complete registration</a>
             </p>`,
    });
  }

  public async sendPasswordRecoveryEmail(
    userEmail: string,
    passwordRecoveryCode: string,
  ) {
    const confirmUrl =
      process.env.APP_HOST +
      'password-recovery?recoveryCode=' +
      passwordRecoveryCode;

    await this.sendMail({
      from: `"Artur Darguzhis" <${this.appConfigService.getGmailLogin}>`,
      to: userEmail,
      subject: 'Password recovery',
      html: `<p>To finish password recovery please follow the link below:
                <a href='${confirmUrl}'>recovery password</a>
             </p>`,
    });
  }
}
