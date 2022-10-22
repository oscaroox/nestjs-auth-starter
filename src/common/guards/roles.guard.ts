import { ROLE_KEY } from '@common/constants/roles.constant';
import { User } from '@database/entities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles.length === 0) {
      return true;
    }

    const user = ctx.getContext().req.user as User;
    const userRoles = user.roles.getItems().map((role) => role.name);
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
