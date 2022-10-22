export const EMAIL_QUEUE = {
  NAME: 'email-queue',
  WELCOME_EMAIL: 'welcome-email',
  RESET_PASSWORD: 'reset-password',
  VERIFY_EMAIL: 'verify-email',
};

type GeneralData = {
  name: string;
  email: string;
  url: string;
};

export type WelcomeEmailData = GeneralData;
export type ResetPasswordEmailData = Omit<GeneralData, 'name'>;
export type VerifyEmailData = GeneralData;
