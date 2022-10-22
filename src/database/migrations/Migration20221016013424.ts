import { Migration } from '@mikro-orm/migrations';

export class Migration20221016013424 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "user" add column "validated" boolean not null default false;',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "validated";');
  }
}
