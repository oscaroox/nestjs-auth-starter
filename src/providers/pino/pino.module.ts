import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@config/config.service';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          pinoHttp: {
            level: config.server.logLevel,
            autoLogging: config.server.isProd,
            transport: !config.server.isProd
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                }
              : undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class PinoProviderModule {}
