import { ConfigService } from '@config/config.service';
import Email from 'email-templates';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { promisify } from 'util';
import { readFile } from 'fs';
import mjmlToHtml from 'mjml';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import mg from 'nodemailer-mailgun-transport';
import path from 'path';

const readFileAsync = promisify(readFile);

@Injectable()
export class Mailer {
  private static transport: nodemailer.Transporter;
  private static mailer: Email;
  private static templateCache = new Map<string, handlebars.TemplateDelegate>();

  private logger = new Logger(Mailer.name);

  public viewPath = path.resolve(__dirname, '..', '..', 'emails');

  constructor(private config: ConfigService) {
    this.init();
  }

  /**
   * Helper method that prefix the frontend app url
   * @param subPath
   * @param token
   * @returns
   */
  makeUrl(subPath: string, token?: string) {
    let url = `${this.config.server.appApiURL}/${subPath}`;
    if (token) url = `${url}/${token}`;
    return url;
  }

  public send(
    template: string,
    to: string,
    locals: Record<string, unknown> = {},
  ) {
    return Mailer.mailer.send({
      template,
      message: {
        to,
      },
      locals: {
        ...locals,
      },
    });
  }

  private init() {
    if (Mailer.mailer && Mailer.transport) return;

    // first setup transport to be used in which environment
    if (this.config.server.isProd) {
      Mailer.transport = nodemailer.createTransport(
        mg({
          auth: {
            apiKey: this.config.email.mailgunAPIKey as string,
            domain: this.config.email.mailgunDomain,
          },
        }),
      );
    } else {
      Mailer.transport = nodemailer.createTransport({ jsonTransport: true });
    }

    Mailer.mailer = new Email({
      message: {
        from: this.config.email.fromMessage,
      },
      subjectPrefix: this.config.server.isProd
        ? false
        : `[${this.config.server.env.toUpperCase()}] `,
      send: this.config.server.isProd,
      preview: this.config.server.isDev,
      transport: Mailer.transport,
      render: this.mjmlRenderer,
      views: {
        options: {
          extension: 'hbs',
        },
      },
    });
  }

  private mjmlRenderer = async (
    view: string,
    locals: Record<string, unknown>,
  ) => {
    this.logger.debug({ view }, 'Rendering template...');
    let template = Mailer.templateCache.get(view);
    if (template) {
      return Mailer.mailer.juiceResources(template(locals));
    }

    this.logger.debug(
      { view },
      'template not found in cache, started compiling and caching....',
    );
    if (view.endsWith('html')) {
      this.logger.debug({ view }, 'compiling html...');
      // get the mjml html
      const mjml = await readFileAsync(
        path.join(this.viewPath, `${view}.mjml`),
        'utf-8',
      );

      // compile the mjml file
      const { html, errors } = mjmlToHtml(mjml, {
        // set the root filepath when using mjml-include
        // the root path is relative to the folder where the mjml exists
        filePath: path.resolve(this.viewPath, view).slice(0, -5),
      });

      if (errors.length > 0) {
        throw new InternalServerErrorException(
          errors,
          `Mjml failed to compile email template ${view}`,
        );
      }
      template = handlebars.compile(html);
    } else {
      this.logger.debug({ view }, 'compiling text...');
      const text = await readFileAsync(
        path.join(this.viewPath, `${view}.hbs`),
        'utf-8',
      );
      template = handlebars.compile(text);
    }
    this.logger.debug({ template }, 'saving in cache');
    Mailer.templateCache.set(view, template);
    return Mailer.mailer.juiceResources(template(locals));
  };
}
