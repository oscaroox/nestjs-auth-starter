import { Authorize } from '@common/decorators/authorize.decorator';
import { User } from '@common/decorators/user.decorator';
import { ValidateArgs } from '@common/decorators/validate-args.decorator';
import { JWTGenericPayload } from '@common/interfaces/jwt-payload.interface';
import { User as UserEntity } from '@database/entities';
import { EmailProducer } from '@jobs/email-queue/email.producer';
import { Logger } from '@nestjs/common';
import { Resolver, Mutation, Query, ID } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ExpiredTokenException } from '../exceptions/expired-token.exception';
import { InvalidCredentials } from '../exceptions/invalid-credentials.exception';
import { UserExistsException } from '../exceptions/user-exists.exception';
import { UpdatePasswordInput } from '../inputs/update-password.input';
import { LoginLocalInput } from '../inputs/login-local.input';
import { RegisterLocalInput } from '../inputs/register-local.input';
import { UpdateEmailInput } from '../inputs/update-email.input';
import { VerifyEmailInput } from '../inputs/verify-email.input';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import * as hashUtil from '../utils/hash.util';
import { JWTResolver, VoidResolver } from 'graphql-scalars';
import { ResetPasswordInput } from '../inputs/reset-password.input';
import { z } from 'zod';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private authService: AuthService,
    private emailProducer: EmailProducer,
  ) {}

  @Mutation(() => JWTResolver)
  async registerLocal(
    @ValidateArgs() args: RegisterLocalInput,
  ): Promise<string> {
    const exists = await this.userService.getByEmail(args.email);

    if (exists) {
      throw new UserExistsException();
    }

    const user = await this.authService.createLocal(args);

    await this.emailProducer.welcomeEmail(user);
    await this.emailProducer.verifyEmail(user);

    return this.authService.createAuthJWT(user);
  }

  @Mutation(() => JWTResolver)
  async loginLocal(@ValidateArgs() args: LoginLocalInput): Promise<string> {
    const exists = await this.userService.getByEmail(args.email);

    if (exists) {
      const match = await hashUtil.verify(args.password, exists.password);
      if (match) {
        return this.authService.createAuthJWT(exists);
      }
    }

    throw new InvalidCredentials();
  }

  @Mutation(() => ID)
  @Authorize()
  async requestVerifyEmail(@User() user: UserEntity): Promise<number> {
    if (!user.validated) {
      await this.emailProducer.verifyEmail(user);
    }
    return user.id;
  }

  @Mutation(() => ID)
  async verifyEmail(@ValidateArgs() args: VerifyEmailInput): Promise<number> {
    const decoded: JWTGenericPayload = await this.jwtService
      .verifyAsync(args.token)
      .catch(() => {
        throw new ExpiredTokenException();
      });

    if (decoded.type !== 'verify-email') {
      throw new ExpiredTokenException();
    }

    const user = await this.userService.getById(decoded.uid);

    if (!user) {
      this.logger.debug(
        { uid: decoded.uid },
        'Failed to find user to validate email',
      );
      throw new ExpiredTokenException();
    }

    if (!user.validated) {
      await this.authService.validateUser(user);
    }

    return user.id;
  }

  @Mutation(() => ID)
  @Authorize()
  async updatePassword(
    @ValidateArgs() args: UpdatePasswordInput,
    @User() user: UserEntity,
  ): Promise<number> {
    await this.authService.updatePassword(user, args.password);

    return user.id;
  }

  @Mutation(() => ID)
  @Authorize()
  async updateEmail(
    @ValidateArgs() args: UpdateEmailInput,
    @User() user: UserEntity,
  ): Promise<number> {
    const exists = await this.userService.getByEmail(args.email);

    if (exists) {
      throw new UserExistsException();
    }

    await this.authService.updateEmail(user, args.email);
    return user.id;
  }

  @Mutation(() => VoidResolver, { nullable: true })
  async requestResetPassword(@ValidateArgs() args: UpdateEmailInput) {
    const user = await this.userService.getByEmail(args.email);

    if (!user) {
      return;
    }

    await this.emailProducer.resetPasswordEmail(user);
  }

  @Mutation(() => ID, { nullable: true })
  async resetPassword(
    @ValidateArgs() args: ResetPasswordInput,
  ): Promise<number> {
    const decoded = this.jwtService.decode(
      args.token,
    ) as JWTGenericPayload | null;

    if (!decoded || decoded.type !== 'reset-password') {
      this.logger.debug('tried to decode token, return null instead...');
      throw new ExpiredTokenException();
    }

    if (!decoded.uid) {
      throw new ExpiredTokenException();
    }

    const id = await z
      .number()
      .min(1)
      .parseAsync(decoded.uid)
      .catch(() => {
        throw new ExpiredTokenException();
      });

    const user = await this.userService.getById(id);

    if (!user) {
      this.logger.debug(
        'successfully decoded token, could not find user in database...',
      );
      throw new ExpiredTokenException();
    }

    await this.jwtService
      .verifyAsync(args.token, {
        secret: user.password,
      })
      .catch((e) => {
        this.logger.debug(e);
        throw new ExpiredTokenException();
      });

    await this.authService.updatePassword(user, args.password);
    return user.id;
  }

  @Query(() => VoidResolver, { nullable: true })
  hello(): void {
    return;
  }
}
