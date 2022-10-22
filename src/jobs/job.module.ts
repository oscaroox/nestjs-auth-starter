import { Mailer } from '@common/helpers/mailer.helper';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EMAIL_QUEUE } from './email-queue/email.constant';
import { EmailConsumer } from './email-queue/email.consumer';
import { EmailProducer } from './email-queue/email.producer';
import { EmailService } from './email-queue/email.service';

@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE.NAME })],
  providers: [EmailService, EmailConsumer, EmailProducer, Mailer],
  exports: [EmailProducer],
})
export class JobModule {}
