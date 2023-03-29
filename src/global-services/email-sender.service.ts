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

  public async sendRegistrationConfirmationEmail(user: UserDocument) {
    if (!user.hasEmailConfirmationCode()) {
      throw new UnprocessableEntityException(
        'Missing confirmation code for email confirmation',
      );
    }

    const confirmUrl = `${this.appConfigService.getAppHost} 'confirm-registration?code=${user.emailConfirmationInfo.confirmationCode}`;

    await this.sendMail({
      from: `"Artur Darguzhis" <${this.appConfigService.getGmailLogin}>`,
      to: user.email,
      subject: 'Thank for your registration',
      html: `<p>To finish registration please follow the link below:
                <a href="${confirmUrl}">complete registration</a>
             </p>`,
    });
  }

  // public async sendPasswordRecoveryEmail(user: UserDocument) {
  //   const confirmUrl =
  //     process.env.APP_HOST +
  //     'password-recovery?recoveryCode=' +
  //     passwordRecoveryCode.code;
  //
  //   await this.sendMail({
  //     from: `"Artur Darguzhis" <${this.appConfigService.getGmailLogin}>`,
  //     to: user.email,
  //     subject: 'Password recovery',
  //     html: `<p>To finish password recovery please follow the link below:
  //               <a href='${confirmUrl}'>recovery password</a>
  //            </p>`,
  //   });
  // }
}
