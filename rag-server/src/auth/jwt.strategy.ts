// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { AuthService } from './auth.service';
// import { ConfigService } from '@nestjs/config';
// import { AuthConfig } from 'src/config/auth.config';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly configService: ConfigService,
//   ) {
//     const secret = configService.get<AuthConfig>('auth')?.jwt.secret;
//     if (!secret) {
//       throw new Error('JWT_SECRET environment variable is not set');
//     }
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: secret,
//     });
//   }

//   async validate(payload: any) {
//     const user = await this.authService.validateUser(payload.sub);
//     return user ? { id: payload.sub, email: payload.email } : null;
//   }
// }
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { UserResponse } from 'src/users/dto/user.response.dto';
import { UsersRepository } from 'src/users/users.repository';
import { AuthConfig } from 'src/config/auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepo: UsersRepository,
    private readonly prisma: PrismaService, // ❗ user lookup should be done here
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1) HTTP-only cookie
        (req: any) => req?.cookies?.['access_token'],
        // 2) Fallback: Authorization: Bearer <token>
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // 3) Optional: query string
        (req: any) => req?.query?.token,
      ]),
      secretOrKey: configService.getOrThrow<AuthConfig>('auth').jwt.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.usersRepo.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return new UserResponse(user);
  }
}
