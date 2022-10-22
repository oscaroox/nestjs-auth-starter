import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@config/config.service';
import { JWTResolver, VoidResolver } from 'graphql-scalars';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (config: ConfigService) => {
        return {
          autoSchemaFile: true,
          // TODO properly configure cache https://www.apollographql.com/docs/apollo-server/performance/cache-backends/
          cache: 'bounded',
          playground: config.server.isDev,
          resolvers: {
            Void: VoidResolver,
            JWT: JWTResolver,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class GraphQLProviderModule {}
