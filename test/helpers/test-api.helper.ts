import request from 'supertest';
import { ExcludeMethods } from '@common/interfaces/exclude-methods.interface';
import { INestApplication } from '@nestjs/common';

type GraphqlRequest<T = Record<string, unknown>> = {
  authToken?: string;
  operationName?: string;
  variables?: T;
  mutation?: string;
  query?: string;
};

type GraphqlErrorResponse = {
  extensions: {
    code: string;
  };
  message: string;
};

type GraphqlResponse<T = Record<string, unknown>> = {
  data: T;
  headers: Record<string, string>;
  errors: GraphqlErrorResponse[];
  //   headerAuthToken: string | undefined;
};

export class TestApi {
  app!: INestApplication;
  public init(app: INestApplication) {
    this.app = app;
  }

  public makeRequest<
    T extends Record<string, unknown>,
    I = Record<string, unknown>,
  >(mutationOrQuery: string, defaultVariables?: ExcludeMethods<I>) {
    return (variables: ExcludeMethods<I>, authToken?: string) =>
      this.request<ExcludeMethods<I>, T>({
        mutation: mutationOrQuery,
        variables: { ...defaultVariables, ...variables },
        authToken,
      });
  }

  async request<I, T = Record<string, unknown>>(
    data: GraphqlRequest<I>,
  ): Promise<GraphqlResponse<T>> {
    const { authToken, mutation, query, variables } = data;

    const req = request(this.app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: mutation || query,
        variables,
      })
      .set('Content-Type', 'application/json');

    if (authToken) {
      req.set('authorization', `Bearer ${authToken}`);
    }

    const res = await req;

    const body = res.body;
    return {
      data: body.data,
      headers: res.headers,
      errors: res.body.errors,
    };
  }
}
