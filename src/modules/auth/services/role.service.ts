import { Repository } from '@common/helpers/repository.helper';
import { Role } from '@database/entities/role.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  getUserRole() {
    return this.getRole('user');
  }

  private getRole(name: string) {
    return this.roleRepo.findOrCreate({ name }, { name });
  }
}
