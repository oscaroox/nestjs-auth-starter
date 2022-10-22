import { Test } from '@nestjs/testing';
import { ConfigService } from '@config/config.service';
import path from 'path';
import { Mailer } from '../mailer.helper';

describe('modules/email/helpers/mailer', () => {
  let mailer: Mailer;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        Mailer,
        {
          provide: ConfigService,
          useValue: {
            server: {
              env: 'test',
              isProd: false,
            },
            email: {
              fromMessage: 'noreply',
            },
          },
        },
      ],
    }).compile();
    mailer = moduleRef.get(Mailer);
    mailer.viewPath = path.resolve(__dirname);
  });

  describe('send', () => {
    it('should send email without errors', async () => {
      const res = await mailer.send('test-email', 'john@example.com', {
        name: 'joe',
      });

      expect(res.originalMessage.to).toEqual('john@example.com');
      expect(res.originalMessage.text).toEqual('Hello joe');
      expect(res.originalMessage.subject).toEqual('[TEST] Test subject');
      expect(res.originalMessage.from).toEqual('noreply');
    });
  });
});
