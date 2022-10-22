import 'reflect-metadata';
import { bootstrap } from './bootstrap';
import { ConfigService } from './config/config.service';

const main = async () => {
  const app = await bootstrap();
  const config = app.get(ConfigService);
  await app.listen(config.server.port);
};

main().catch(console.error);
