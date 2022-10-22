import { Inject, Injectable } from '@nestjs/common';
import { JWTConfig, jwtConfig } from './jwt/jwt.config';
import { databaseConfig, DatabaseConfig } from './database/database.config';
import { EmailConfig, emailConfig } from './email/email.config';
import { RedisConfig, redisConfig } from './redis/redis.config';
import { serverConfig, ServerConfig } from './server/server.config';

@Injectable()
export class ConfigService {
  @Inject(jwtConfig.KEY)
  public jwt!: JWTConfig;

  @Inject(serverConfig.KEY)
  public server!: ServerConfig;

  @Inject(databaseConfig.KEY)
  public database!: DatabaseConfig;

  @Inject(redisConfig.KEY)
  public redis!: RedisConfig;

  @Inject(emailConfig.KEY)
  public email!: EmailConfig;
}
