import { User } from '@database/entities';
import { EntityData } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { AuthService } from '@modules/auth/services/auth.service';
import { RoleService } from '@modules/auth/services/role.service';
import { UserFactory } from '@test/factories/user.factory';
import { TestServer } from './test-server.helper';

export class UserManager {
  private em!: EntityManager;
  private authService!: AuthService;
  private roleService!: RoleService;

  init(server: TestServer) {
    this.em = server.get(EntityManager);
    this.authService = server.get(AuthService);
    this.roleService = server.get(RoleService);
  }
  async createUser(data: EntityData<User> = {}) {
    const role = await this.roleService.getUserRole();
    const user = await new UserFactory(this.em)
      .each((u) => u.roles.add(role))
      .createOne(data);
    const token = await this.authService.createAuthJWT(user);
    return { user, token };
  }
}
