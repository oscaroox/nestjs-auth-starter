import { Mailer } from '@common/helpers/mailer.helper';
import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  EMAIL_QUEUE,
  ResetPasswordEmailData,
  VerifyEmailData,
  WelcomeEmailData,
} from './email.constant';

@Processor(EMAIL_QUEUE.NAME)
export class EmailConsumer {
  private logger = new Logger(EmailConsumer.name);

  constructor(private mailer: Mailer) {}

  @OnQueueFailed()
  onQueueFailed(job: Job, error: Error) {
    this.logger.error({ error, job }, 'jobs fired a exception');
  }

  @OnQueueActive()
  onQueueActive(job: Job) {
    this.logger.debug({ job }, 'active jobs');
  }

  @Process(EMAIL_QUEUE.WELCOME_EMAIL)
  welcomeEmail(job: Job<WelcomeEmailData>) {
    return this.mailer.send(EMAIL_QUEUE.WELCOME_EMAIL, job.data.email, {
      name: job.data.name,
      appURL: job.data.url,
    });
  }

  @Process(EMAIL_QUEUE.RESET_PASSWORD)
  resetPasswordEmail(job: Job<ResetPasswordEmailData>) {
    return this.mailer.send(EMAIL_QUEUE.RESET_PASSWORD, job.data.email, {
      resetPasswordURL: job.data.url,
    });
  }

  @Process(EMAIL_QUEUE.VERIFY_EMAIL)
  async verifyEmail(job: Job<VerifyEmailData>) {
    return this.mailer.send(EMAIL_QUEUE.VERIFY_EMAIL, job.data.email, {
      name: job.data.name,
      verifyURL: job.data.url,
    });
  }
}
