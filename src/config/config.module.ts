import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { jwtConfig } from './jwt/jwt.config';
import { ConfigService } from './config.service';
import { databaseConfig } from './database/database.config';
import { emailConfig } from './email/email.config';
import { redisConfig } from './redis/redis.config';
import { serverConfig } from './server/server.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, serverConfig, emailConfig, jwtConfig],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
