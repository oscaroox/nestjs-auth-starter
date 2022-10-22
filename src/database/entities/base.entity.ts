import { Entity, PrimaryKey } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity({ abstract: true })
export abstract class BaseEntity {
  @Field()
  @PrimaryKey()
  id!: number;
}
