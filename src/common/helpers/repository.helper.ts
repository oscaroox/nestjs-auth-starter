import { BaseEntity } from '@database/entities/base.entity';
import { FilterQuery, RequiredEntityData } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';

export class Repository<T extends BaseEntity> extends EntityRepository<T> {
  public async findOrCreate(
    query: FilterQuery<T>,
    data: RequiredEntityData<T>,
  ) {
    const found = await this.findOne(query);
    if (found) {
      return found;
    }

    const entity = this.create(data);
    await this.persist(entity).flush();
    return entity;
  }
}
