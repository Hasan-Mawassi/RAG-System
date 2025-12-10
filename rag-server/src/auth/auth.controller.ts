import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { minutes, Throttle } from '@nestjs/throttler';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Authentication')
@ApiCookieAuth()
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  @Post('register')
  @Throttle({ short: { limit: 7, ttl: minutes(1) } })
  @ApiOperation({
    summary: 'Create a new user account',
    description:
      'Registers a new user, stores their credentials, and automatically logs them in by setting secure cookies.',
  })
  @ApiCreatedResponse({
    type: AuthUserResponseDto,
    description: 'User successfully registered.',
    examples: {
      success: {
        summary: 'Successful registration',
        value: {
          user: {
            id: 'clw12od881000af12zyd7o3k2',
            email: 'hasan@example.com',
            createdAt: '2025-01-01T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      valid: {
        summary: 'Valid register request',
        value: {
          email: 'hasan@example.com',
          password: 'StrongPass123!',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error. One or more fields are invalid.',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserResponseDto> {
    const { user, accessToken, refreshToken } =
      await this.authService.register(dto);

    this.setAuthCookies(res, accessToken, refreshToken);

    // We don't need to return tokens to frontend anymore
    return { user };
  }

  @Post('login')
  @Throttle({ short: { limit: 3, ttl: minutes(1) } })
  @ApiOperation({
    summary: 'Login user',
    description:
      'Validates user credentials and sets access/refresh tokens in secure cookies.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      valid: {
        summary: 'Valid login request',
        value: {
          email: 'hasan@example.com',
          password: 'StrongPass123!',
        },
      },
    },
  })
  @ApiOkResponse({
    type: AuthUserResponseDto,
    description: 'User authenticated successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many login attempts. Try again later.',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserResponseDto> {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);

    this.setAuthCookies(res, accessToken, refreshToken);

    return { user };
  }
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Uses refresh token from cookies to generate a new access token. If refresh token is invalid or expired, user must login again.',
  })
  @ApiOkResponse({
    type: RefreshResponseDto,
    description: 'Token refreshed successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token missing, invalid, or expired.',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    const refreshToken = req.cookies?.['refresh_token'];

    const {
      user,
      accessToken,
      refreshToken: newRefresh,
    } = await this.authService.refreshTokens(refreshToken);

    this.setAuthCookies(res, accessToken, newRefresh);

    return { user };
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated user',
    description:
      'Returns the currently authenticated user using the access token cookie.',
  })
  @ApiOkResponse({
    type: MeResponseDto,
    description: 'Authenticated user retrieved.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token missing or invalid.',
  })
  async me(@Req() req): Promise<MeResponseDto> {
    return { user: await req.user };
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Clears authentication cookies and invalidates refresh token in the database.',
  })
  @ApiOkResponse({
    type: LogoutResponseDto,
    description: 'User logged out successfully.',
    examples: {
      success: {
        summary: 'Successful logout response',
        value: {
          success: true,
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error when logging out.',
  })
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    await this.authService.logout(req.user.id);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { success: true };
  }
}
