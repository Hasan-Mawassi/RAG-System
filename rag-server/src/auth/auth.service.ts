import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password/password.service';
import { UsersRepository } from 'src/users/users.repository';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'src/config/auth.config';
import { UserResponse } from 'src/users/dto/user.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly usersRepo: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  // Create new user
  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hash = await this.passwordService.hashPassword(dto.password);

    const user = await this.usersRepo.createUser(dto.email, hash);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: new UserResponse(user),
      ...tokens,
    };
  }

  // Login
  async login(dto: LoginDto) {
    const user = await this.usersRepo.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.passwordService.comparePasswords(
      dto.password,
      user.passwordHash,
    );
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: new UserResponse(user),
      ...tokens,
    };
  }

  // JWT payload creator
  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const refreshSecret =
      this.configService.get<AuthConfig>('auth')?.jwt.refreshSecret;
    if (!refreshSecret) {
      throw new Error('Missing refresh token secret in config');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersRepo.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await this.passwordService.comparePasswords(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Refresh token no longer valid');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: new UserResponse(user),
      ...tokens,
    };
  }
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { success: true };
  }
  private async getTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessSecret = this.configService.get<AuthConfig>('auth')?.jwt.secret;
    const refreshSecret =
      this.configService.get<AuthConfig>('auth')?.jwt.refreshSecret;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: '3600s', // ⏱ access token short
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: '7d', // ⏱ refresh token longer
    });

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await this.passwordService.hashPassword(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: hashed,
      },
    });
  }
}
