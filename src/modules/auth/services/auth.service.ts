import { Repository } from '@common/helpers/repository.helper';
import { JWTAuthPayload } from '@common/interfaces/jwt-payload.interface';
import { ConfigService } from '@config/config.service';
import { User } from '@database/entities';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterLocalInput } from '../inputs/register-local.input';
import * as hashUtil from '../utils/hash.util';
import { RoleService } from './role.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private roleService: RoleService,
    private configService: ConfigService,
  ) {}

  async createLocal(input: RegisterLocalInput) {
    const user = this.userRepo.create({
      email: input.email,
      password: await hashUtil.hash(input.password),
      name: input.name,
      validated: false,
    });

    user.roles.add(await this.roleService.getUserRole());

    return this.userRepo.persistAndFlush(user).then(() => user);
  }

  createAuthJWT(user: User) {
    return this.jwtService.signAsync({ uid: user.id } as JWTAuthPayload, {
      secret: this.configService.jwt.authSecret,
      expiresIn: this.configService.jwt.authExpiresIn,
    });
  }

  validateUser(user: User) {
    user.validated = true;
    return this.userRepo.persistAndFlush(user);
  }

  async updatePassword(user: User, newPassword: string) {
    user.password = await hashUtil.hash(newPassword);
    return this.userRepo.persistAndFlush(user);
  }

  async updateEmail(user: User, newEmail: string) {
    user.email = newEmail;
    return this.userRepo.persistAndFlush(user);
  }

  getUserWithRoles(id: number) {
    return this.userRepo.findOne({ id }, { populate: ['roles'] });
  }
}
