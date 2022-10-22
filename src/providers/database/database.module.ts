import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@config/config.service';
import getMikroOrmConfig from './mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return getMikroOrmConfig(config);
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseProviderModule {}
