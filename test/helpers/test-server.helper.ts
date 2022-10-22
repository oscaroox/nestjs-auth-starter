/* eslint-disable @typescript-eslint/no-empty-function */
import { MikroORM } from '@mikro-orm/core';
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AppModule } from '@modules/app.module';
import { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserManager } from './user-manager.helper';
import { TestApi } from './test-api.helper';

export class TestServer {
  private app!: INestApplication;
  public em!: EntityManager;
  public orm!: MikroORM<PostgreSqlDriver>;

  public async init() {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication({ logger: false });
    await app.init();

    this.app = app;
    this.orm = this.app.get<MikroORM<PostgreSqlDriver>>(MikroORM);
    this.em = this.orm.em.fork();
    return this.app;
  }

  public static createTestEnvironment() {
    const server = new TestServer();
    const userManager = new UserManager();
    const testApi = new TestApi();

    return {
      server,
      userManager,
      testApi,
      async initialize() {
        const app = await server.init();
        userManager.init(server);
        testApi.init(app);
      },
    };
  }

  public async close() {
    await this.app.close();
  }

  public async refreshDatabase() {
    return this.orm.getSchemaGenerator().refreshDatabase();
  }

  public get<T>(type: string | Type<T>): T {
    return this.app.get(type);
  }
}
