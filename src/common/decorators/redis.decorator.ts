import { REDIS_PROVIDER_CLIENT } from '@common/constants/redis.constant';
import { Inject } from '@nestjs/common';

export const RedisClient = () => Inject(REDIS_PROVIDER_CLIENT);
