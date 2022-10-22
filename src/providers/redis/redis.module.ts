import { REDIS_PROVIDER_CLIENT } from '@common/constants/redis.constant';
import { RedisClient } from '@common/decorators/redis.decorator';
import { ConfigService } from '@config/config.service';
import { Module, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: REDIS_PROVIDER_CLIENT,
      useFactory: async (config: ConfigService) => {
        return new Redis({
          port: config.redis.port,
          host: config.redis.host,
        });
      },
    },
  ],
  exports: [REDIS_PROVIDER_CLIENT],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@RedisClient() private redisClient: Redis) {}
  onModuleDestroy() {
    return this.redisClient.quit();
  }
}
