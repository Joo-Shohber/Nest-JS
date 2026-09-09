import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   *
   * @param email of register user
   * @param link with id and verification token
   */
  public async sendVerificationToken(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: 'Nest JS',
        subject: 'Verification',
        template: 'verification-token',
        context: { link },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  /**
   *  Reset Password
   * @param email
   * @param resetPasswordlink
   */
  public async sendResetPassword(email: string, resetPasswordlink: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: 'Nest JS',
        subject: 'Reset Password',
        template: 'reset-password',
        context: { resetPasswordlink },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
