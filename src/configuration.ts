import * as process from 'process';

export const getConfiguration = () => ({
  APP_HOST: process.env.APP_HOST,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV,
  LOGIN_FOR_ADMIN_BASIC_AUTH: process.env.LOGIN_FOR_ADMIN_BASIC_AUTH,
  PASSWORD_FOR_ADMIN_BASIC_AUTH: process.env.PASSWORD_FOR_ADMIN_BASIC_AUTH,
  JWT_SECRET: process.env.JWT_SECRET,
  GMAIL_APP_LOGIN: process.env.GMAIL_APP_LOGIN,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  PORT: process.env.PORT,
  COOKIE_MAX_AGE: process.env.COOKIE_MAX_AGE,
});

export type ConfigType = ReturnType<typeof getConfiguration>;
