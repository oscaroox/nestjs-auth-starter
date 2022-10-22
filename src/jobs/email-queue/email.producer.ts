import { Mailer } from '@common/helpers/mailer.helper';
import { ConfigService } from '@config/config.service';
import { User } from '@database/entities';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import {
  EMAIL_QUEUE,
  ResetPasswordEmailData,
  VerifyEmailData,
  WelcomeEmailData,
} from './email.constant';
import { EmailService } from './email.service';

@Injectable()
export class EmailProducer {
  appURL: string;

  constructor(
    @InjectQueue(EMAIL_QUEUE.NAME) private emailQueue: Queue,
    private mailer: Mailer,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.appURL = this.configService.server.appUrl;
  }

  async welcomeEmail(user: User) {
    const data: WelcomeEmailData = {
      name: user.name,
      email: user.email,
      url: this.appURL,
    };
    return this.emailQueue.add(EMAIL_QUEUE.WELCOME_EMAIL, data);
  }

  async resetPasswordEmail(user: User) {
    const token = await this.emailService.createResetPasswordJWT(user);
    const data: ResetPasswordEmailData = {
      email: user.email,
      url: this.mailer.makeUrl(EMAIL_QUEUE.RESET_PASSWORD, token),
    };
    return this.emailQueue.add(EMAIL_QUEUE.RESET_PASSWORD, data);
  }

  async verifyEmail(user: User) {
    const verifyToken = await this.emailService.createVerifyEmailJWT(user);
    const data: VerifyEmailData = {
      name: user.name,
      email: user.email,
      url: this.mailer.makeUrl(EMAIL_QUEUE.VERIFY_EMAIL, verifyToken),
    };
    return this.emailQueue.add(EMAIL_QUEUE.VERIFY_EMAIL, data);
  }
}
