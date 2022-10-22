import { Entity, Index, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity()
export class Role extends BaseEntity {
  @Property()
  @Index()
  name!: string;
}
