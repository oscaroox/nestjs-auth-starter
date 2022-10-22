import { Repository } from '@common/helpers/repository.helper';
import { ConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';
import { Options } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';
import { resolve } from 'path';

export default async function (conf?: ConfigService): Promise<Options> {
  let config: ConfigService;

  if (conf) {
    config = conf;
  } else {
    const app = await NestFactory.create(ConfigModule, { bufferLogs: true });
    config = app.get(ConfigService);
  }

  const dbConfig = config.database;
  return {
    entities: [resolve(__dirname, '..', '..', 'database', 'entities')],
    migrations: {
      path: resolve(__dirname, '..', '..', 'database', 'migrations'),
    },
    seeder: {
      path: resolve(__dirname, '..', '..', 'database', 'seeders'),
    },
    type: 'postgresql',
    dbName: dbConfig.dbName,
    user: dbConfig.user,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    entityRepository: Repository,
    allowGlobalContext: config.server.isTest,
  };
}
