import { Migration } from '@mikro-orm/migrations';

export class Migration20221021231645 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "user" add column "name" varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "name";');
  }
}
