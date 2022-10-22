import { TestServer } from '@test/helpers/test-server.helper';
import { faker } from '@faker-js/faker';
import { User } from '@database/entities/user.entity';
import { UserFactory } from '@test/factories/user.factory';
import { JwtService } from '@nestjs/jwt';
import * as hashUtil from '@modules/auth/utils/hash.util';
import {
  EMAIL_QUEUE,
  ResetPasswordEmailData,
  VerifyEmailData,
  WelcomeEmailData,
} from '@jobs/email-queue/email.constant';
import { ConfigService } from '@config/config.service';
import {
  GenericPayloadType,
  JWTGenericPayload,
} from '@common/interfaces/jwt-payload.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { EmailProducer } from '@jobs/email-queue/email.producer';
import { ResetPasswordInput } from '@modules/auth/inputs/reset-password.input';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { Mailer } from '@common/helpers/mailer.helper';
import { EmailService } from '@jobs/email-queue/email.service';

let jwtService: JwtService;
let authService: AuthService;
let emailService: EmailService;
let emailQueue: Queue;
let mailer: Mailer;
let configService: ConfigService;

const { server, userManager, initialize, testApi } =
  TestServer.createTestEnvironment();

beforeAll(async () => {
  await initialize();
  emailQueue = server.get<Queue>(getQueueToken(EMAIL_QUEUE.NAME));
  jwtService = server.get(JwtService);
  authService = server.get(AuthService);
  emailService = server.get(EmailService);
  mailer = server.get(Mailer);
  configService = server.get(ConfigService);
  await server.refreshDatabase();
});

afterAll(async () => {
  await server.close();
});

beforeEach(() => {
  return jest.clearAllMocks();
});

describe('modules/auth/resolvers/auth-resolver (e2e)', () => {
  describe('registerLocal', () => {
    const request = testApi.makeRequest<Record<'registerLocal', string>>(
      `
      mutation registerLocal($email: String!, $password: String!, $name: String!) {
        registerLocal(input: { email: $email, password: $password, name: $name })
      }
    `,
      {
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.fullName(),
      },
    );

    it('should register a new user', async () => {
      const email = faker.internet.email();

      const res = await request({
        email,
      });

      expect(res.errors).not.toBeDefined();
      expect(res.data.registerLocal).toBeDefined();

      const user = await server.em.findOneOrFail(User, {
        email,
      });

      expect(user.email).toEqual(email);
    });

    it("should register a new user with role 'user'", async () => {
      const email = faker.internet.email();
      const res = await request({
        email,
      });
      expect(res.errors).not.toBeDefined();
      const user = await server.em.findOneOrFail(
        User,
        { email },
        { populate: ['roles'] },
      );
      const roles = user.roles.getItems();

      expect(roles.length).toEqual(1);
      expect(roles[0].name).toEqual('user');
    });

    it('should return a valid jwt token', async () => {
      const res = await request({});

      expect(res.errors).not.toBeDefined();
      const config = server.get(ConfigService);

      await expect(
        jwtService.verifyAsync(res.data.registerLocal, {
          secret: config.jwt.authSecret,
        }),
      ).resolves.not.toThrowError();
    });

    it('should save the user with a hashed password', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      await request({
        email,
        password,
      });

      const saved = await server.em.findOneOrFail(User, { email });

      expect(saved.password).not.toEqual(password);
      expect(await hashUtil.verify(password, saved.password)).toBeTruthy();
    });

    it('should not register a user with invalid input', async () => {
      const res = await request({
        email: 'not an email',
        password: 'test',
      });

      expect(res.errors).toBeDefined();

      const errors = res.errors[0].extensions;
      expect(errors.code).toEqual('BAD_USER_INPUT');
    });

    it('should not register an existing user', async () => {
      const { user } = await userManager.createUser();

      const res = await request({
        email: user.email,
      });

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('USER_EXISTS');
    });

    it('should add welcome and verification email to queue', async () => {
      const email = faker.internet.email();
      const queueSpy = jest.spyOn(emailQueue, 'add');
      await request({ email });

      const user = await server.em.findOneOrFail(User, { email });

      expect(queueSpy).toHaveBeenCalledTimes(2);

      const welcomeEmailData: WelcomeEmailData = {
        email: user.email,
        name: user.name,
        url: configService.server.appUrl,
      };

      expect(queueSpy).toHaveBeenCalledWith(
        EMAIL_QUEUE.WELCOME_EMAIL,
        welcomeEmailData,
      );

      const token = queueSpy.mock.calls[1][1].url.split('/').pop();

      const verifyEmailData: VerifyEmailData = {
        ...welcomeEmailData,
        url: mailer.makeUrl(EMAIL_QUEUE.VERIFY_EMAIL, token),
      };

      expect(queueSpy).toHaveBeenCalledWith(
        EMAIL_QUEUE.VERIFY_EMAIL,
        verifyEmailData,
      );

      const decoded = await jwtService.verifyAsync<JWTGenericPayload>(token);

      expect(decoded.type).toEqual<GenericPayloadType>('verify-email');
      expect(decoded.uid).toEqual(user.id);
    });
  });

  describe('loginLocal', () => {
    const request = testApi.makeRequest<Record<'loginLocal', string>>(
      `
      mutation loginLocal($email: String!, $password: String!) {
        loginLocal(input: { email: $email, password: $password })
      }
    `,
      {
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    );

    it('should successfully login user', async () => {
      const { user } = await userManager.createUser({
        password: 'testing1234',
      });

      const res = await request({
        email: user.email,
        password: 'testing1234',
      });

      const config = server.get(ConfigService);

      expect(res.errors).not.toBeDefined();
      await expect(
        jwtService.verifyAsync(res.data.loginLocal, {
          secret: config.jwt.authSecret,
        }),
      ).resolves.not.toThrowError();
    });

    it('should not successfully login user with invalid input', async () => {
      const res = await request({
        email: 'not-a-email',
        password: 'test',
      });

      expect(res.errors).toBeDefined();

      expect(res.errors[0].extensions.code).toEqual('BAD_USER_INPUT');
    });

    it('should not login the user with invalid email', async () => {
      const res = await request({
        email: 'userdoesnotexists@example.com',
        password: 'testing123',
      });

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('INVALID_CREDENTIALS');
    });

    it('should not login the user with invalid password', async () => {
      const { user } = await userManager.createUser();

      const res = await request({
        email: user.email,
        password: 'not-the-password',
      });

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('INVALID_CREDENTIALS');
    });
  });

  describe('requestVerifyEmail', () => {
    const request = testApi.makeRequest<Record<'requestVerifyEmail', string>>(`
      mutation {
        requestVerifyEmail
      }
    `);
    it('should successfully request a email verification email', async () => {
      const { user, token } = await userManager.createUser({
        validated: false,
      });

      const queueSpy = jest.spyOn(emailQueue, 'add');
      const res = await request({}, token);

      expect(res.errors).not.toBeDefined();
      expect(res.data.requestVerifyEmail).toEqual(user.id.toString());
      expect(queueSpy).toHaveBeenCalledTimes(1);

      const jwt = queueSpy.mock.calls[0][1].url.split('/').pop();

      const payload: VerifyEmailData = {
        email: user.email,
        name: user.name,
        url: mailer.makeUrl(EMAIL_QUEUE.VERIFY_EMAIL, jwt),
      };

      expect(queueSpy).toHaveBeenCalledWith(EMAIL_QUEUE.VERIFY_EMAIL, payload);
    });

    it('should not send verification email for validated user', async () => {
      const { user, token } = await userManager.createUser({
        validated: true,
      });
      const queueSpy = jest.spyOn(emailQueue, 'add');

      const res = await request({}, token);

      expect(res.errors).not.toBeDefined();
      expect(res.data.requestVerifyEmail).toEqual(user.id.toString());
      expect(queueSpy).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    const request = testApi.makeRequest<Record<'verifyEmail', number>>(`
      mutation verifyEmail($token: String!) {
        verifyEmail(input: { token: $token })
      }
    `);

    it('should verify the user with a valid token', async () => {
      let { user } = await userManager.createUser();

      const payload: JWTGenericPayload = {
        type: 'verify-email',
        uid: user.id,
      };
      const jwt = await jwtService.signAsync(payload);

      expect(user.validated).toBeFalsy();

      const res = await request({ token: jwt });

      expect(res.errors).not.toBeDefined();
      expect(res.data.verifyEmail).toEqual(user.id.toString());

      user = await server.em.findOneOrFail(User, { email: user.email });

      expect(user.validated).toBeTruthy();
    });

    it('should not verify the user with a invalid token', async () => {
      const res = await request({ token: '$.test.test' });
      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('EXPIRED_TOKEN');
    });

    it('should not verify the user with a expired token', async () => {
      const jwt = await jwtService.signAsync({}, { expiresIn: '-10s' });
      const res = await request({ token: jwt });

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('EXPIRED_TOKEN');
    });
  });

  describe('updatePassword', () => {
    const request = testApi.makeRequest<Record<'updatePassword', string>>(`
      mutation updatePassword($password: String!) {
        updatePassword(input: { password: $password })
      }
    `);

    it('should successfully change the users password', async () => {
      const { user, token } = await userManager.createUser({
        password: 'this-is-a-password',
      });

      const newPassword = 'john-doe123';

      const res = await request(
        {
          password: newPassword,
        },
        token,
      );

      expect(res.errors).not.toBeDefined();

      const updated = await server.em.findOneOrFail(User, {
        email: user.email,
      });

      expect(await hashUtil.verify(newPassword, updated.password)).toBeTruthy();
      expect(
        await hashUtil.verify('this-is-a-password', updated.password),
      ).toBeFalsy();
    });

    it('should not allow unauthenticated users to change password', async () => {
      const res = await request({
        password: 'testing123',
      });

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
    });

    it('should not change the users password with invalid data', async () => {
      const { token } = await userManager.createUser();
      const res = await request({ password: 'test' }, token);

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('BAD_USER_INPUT');
    });
  });

  describe('updateEmail', () => {
    const request = testApi.makeRequest<Record<'updateEmail', string>>(`
      mutation updateEmail($email: String!) {
        updateEmail(input: { email: $email })
      }
    `);

    it('should successfully change the users email', async () => {
      const email = faker.internet.email();
      const { token } = await userManager.createUser({ email });

      const newEmail = faker.internet.email();
      const res = await request({ email: newEmail }, token);

      const updated = await server.em.findOneOrFail(User, { email: newEmail });

      expect(res.errors).not.toBeDefined();
      expect(res.data.updateEmail).toEqual(updated.id.toString());
      expect(updated.email).toEqual(newEmail);
    });

    it('should not change the users email if email already exists', async () => {
      const { user: user1 } = await userManager.createUser();
      const { token } = await userManager.createUser();

      const res = await request({ email: user1.email }, token);

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('USER_EXISTS');
    });

    it('should not allow unauthenticated users to change email', async () => {
      const res = await request({ email: 'testing@live.com' });
      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
    });
  });

  describe('requestResetPassword', () => {
    const request = testApi.makeRequest<Record<'requestResetPassword', null>>(`
        mutation requestResetPassword($email: String!) {
          requestResetPassword(input: { email: $email })
        }
      `);

    it('should successfully request a password reset', async () => {
      const { user } = await userManager.createUser();
      const queueSpy = jest.spyOn(emailQueue, 'add');
      const res = await request({ email: user.email });

      expect(res.errors).not.toBeDefined();

      expect(queueSpy).toHaveBeenCalledTimes(1);

      const token = queueSpy.mock.calls[0][1].url.split('/').pop();

      const welcomeEmailData: ResetPasswordEmailData = {
        email: user.email,
        url: mailer.makeUrl(EMAIL_QUEUE.RESET_PASSWORD, token),
      };

      expect(queueSpy).toHaveBeenCalledWith(
        EMAIL_QUEUE.RESET_PASSWORD,
        welcomeEmailData,
      );

      const decoded = await jwtService.verifyAsync<JWTGenericPayload>(token, {
        secret: user.password,
      });

      expect(decoded.type).toEqual<GenericPayloadType>('reset-password');
      expect(decoded.uid).toEqual(user.id);
    });

    it('should successfully request a password reset for a none existing user', async () => {
      const emailProducer = server.get(EmailProducer);
      const producerSpy = jest.spyOn(emailProducer, 'resetPasswordEmail');
      await request({ email: faker.internet.email() });

      expect(producerSpy).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const request = testApi.makeRequest<
      Record<'resetPassword', string>,
      ResetPasswordInput
    >(`
      mutation resetPassword($token: JWT!, $password: String!) {
        resetPassword(input: { token: $token, password: $password })
      }
    `);

    it('should successfully reset the users password with a one-time token', async () => {
      const { user } = await userManager.createUser({
        password: 'another-password',
      });

      const token = await emailService.createResetPasswordJWT(user);

      const res = await request({
        token,
        password: 'new-another-password',
      });

      expect(res.errors).not.toBeDefined();

      const updated = await server.em.findOneOrFail(User, {
        email: user.email,
      });

      expect(
        await hashUtil.verify('new-another-password', updated.password),
      ).toBeTruthy();
    });

    it('should not be able to use a expired/invalid token', async () => {
      let res = await request({
        token: '23423.234234.234234',
        password: faker.internet.password(),
      });

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('EXPIRED_TOKEN');

      const user = await new UserFactory(server.em).createOne();
      // generate invalid token using a different secret
      const jwt = await authService.createAuthJWT(user);

      res = await request({
        token: jwt,
        password: faker.internet.password(),
      });

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('EXPIRED_TOKEN');
    });

    it('should not be able to use the one-time token twice', async () => {
      const { user } = await userManager.createUser();
      const token = await emailService.createResetPasswordJWT(user);
      let res = await request({
        token,
        password: 'new-another-password',
      });

      expect(res.errors).not.toBeDefined();

      res = await request({
        token,
        password: 'new-another-password',
      });

      expect(res.errors).toBeDefined();
      expect(res.errors[0].extensions.code).toEqual('EXPIRED_TOKEN');
    });
  });
});
