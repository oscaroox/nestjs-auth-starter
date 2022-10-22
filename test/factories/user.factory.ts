import { User } from '@database/entities';
import { EntityData } from '@mikro-orm/core';
import { Factory, Faker } from '@mikro-orm/seeder';
import * as hashUtil from '@modules/auth/utils/hash.util';

export class UserFactory extends Factory<User> {
  model = User;
  protected definition(faker: Faker): EntityData<User> {
    return {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.name.fullName(),
      validated: false,
    };
  }

  private async hashPassword(params: EntityData<User> = {}) {
    params.password = await hashUtil.hash(params.password ?? 'testing123');
    return params;
  }

  async createOne(overrideParameters: EntityData<User> = {}): Promise<User> {
    return super.createOne(await this.hashPassword(overrideParameters));
  }

  async create(
    amount: number,
    overrideParameters?: EntityData<User> | undefined,
  ): Promise<User[]> {
    return super.create(amount, await this.hashPassword(overrideParameters));
  }
}
