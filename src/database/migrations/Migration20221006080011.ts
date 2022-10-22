import { Migration } from '@mikro-orm/migrations';

export class Migration20221006080011 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "role" ("id" serial primary key, "name" varchar(255) not null);',
    );
    this.addSql('create index "role_name_index" on "role" ("name");');

    this.addSql(
      'create table "user_role" ("user_id" int not null, "role_id" int not null, constraint "user_role_pkey" primary key ("user_id", "role_id"));',
    );

    this.addSql(
      'alter table "user_role" add constraint "user_role_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "user_role" add constraint "user_role_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user_role" drop constraint "user_role_role_id_foreign";',
    );

    this.addSql('drop table if exists "role" cascade;');

    this.addSql('drop table if exists "user_role" cascade;');
  }
}
