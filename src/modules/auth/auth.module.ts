import { Role } from '@database/entities/role.entity';
import { User } from '@database/entities/user.entity';
import { JobModule } from '@jobs/job.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JWTProviderModule } from '@providers/jwt/jwt.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthService } from './services/auth.service';
import { RoleService } from './services/role.service';
import { UserService } from './services/user.service';
import { JWTStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JWTProviderModule,
    JobModule,
    PassportModule,
    MikroOrmModule.forFeature({
      entities: [User, Role],
    }),
  ],
  providers: [AuthResolver, UserService, AuthService, RoleService, JWTStrategy],
})
export class AuthModule {}
