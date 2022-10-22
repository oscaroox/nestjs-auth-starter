import { Field, ObjectType } from '@nestjs/graphql';
import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @Property({ unique: true })
  email!: string;

  @Field()
  @Property({ hidden: true })
  password!: string;

  @Field()
  @Property()
  name!: string;

  @Field()
  @Property({ default: false })
  validated!: boolean;

  @ManyToMany({ entity: () => Role, pivotTable: 'user_role' })
  roles = new Collection<Role>(this);
}
