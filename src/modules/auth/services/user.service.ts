import { Repository } from '@common/helpers/repository.helper';
import { User } from '@database/entities/user.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  getById(id: number) {
    return this.userRepo.findOne({ id });
  }

  getByEmail(email: string) {
    return this.userRepo.findOne({ email });
  }
}
