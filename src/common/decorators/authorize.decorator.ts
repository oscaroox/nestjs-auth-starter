import { ROLE_KEY } from '@common/constants/roles.constant';
import { JWTAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

export const Authorize = (roles?: string | string[]) =>
  applyDecorators(
    SetMetadata(ROLE_KEY, [roles].filter((e) => e).flat()),
    UseGuards(JWTAuthGuard, RolesGuard),
  );
