import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseProviderModule } from '@providers/database/database.module';
import { GraphQLProviderModule } from '@providers/graphql/graphql.module';
import { ConfigModule } from '@config/config.module';
import { PinoProviderModule } from '@providers/pino/pino.module';
import { JWTProviderModule } from '@providers/jwt/jwt.module';
import { BullProviderModule } from '@providers/bull/bull.module';
import { RedisModule } from '@providers/redis/redis.module';

@Module({
  imports: [
    RedisModule,
    JWTProviderModule,
    PinoProviderModule,
    ConfigModule,
    DatabaseProviderModule,
    BullProviderModule,
    GraphQLProviderModule,
    AuthModule,
  ],
})
export class AppModule {}
