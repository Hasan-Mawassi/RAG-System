import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string | number;
    refreshSecret: string;
    refreshExpiresIn: string | number;
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
      refreshSecret: process.env.JWT_REFRESH_SECRET as string,
      refreshExpiresIn: process.env.JWT_REFRESH_SECRET_EXPIRES_IN || '7d',
    },
  }),
);
