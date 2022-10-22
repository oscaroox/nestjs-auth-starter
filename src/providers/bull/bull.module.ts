import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@config/config.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          redis: {
            host: configService.redis.host,
            port: configService.redis.port,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class BullProviderModule {}
