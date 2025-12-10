import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from 'prisma/prisma.module';
import { PasswordService } from './password/password.service';
import { TypedConfigService } from 'src/config/typed.config.service';
import { AuthConfig } from 'src/config/auth.config';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: TypedConfigService) => {
        return {
          secret: config.get<AuthConfig>('auth')?.jwt.secret,
          signOptions: {
            expiresIn: config.get<AuthConfig>('auth')?.jwt.expiresIn as
              | `${number}s`
              | number,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService, UsersRepository],
  exports: [AuthService],
})
export class AuthModule {}
