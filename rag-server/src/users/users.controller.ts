import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { UserDeleteResponseDto } from './dto/user-delete-response.dto';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UserResponse } from './dto/user.response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid user data' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Array of users',
    type: [UserResponse],
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<UserResponse[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user details' })
  @ApiOkResponse({ type: UserResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getMe(@Req() req): Promise<UserResponse> {
    return req.user; // comes from JwtStrategy.validate()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', example: 'clu1px9s10009absde1d8' })
  @ApiOkResponse({
    description: 'User found',
    type: UserResponse,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponse,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({
    description: 'User deleted successfully',
    type: UserDeleteResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async remove(@Param('id') id: string): Promise<UserDeleteResponseDto> {
    return this.usersService.remove(id);
  }
}
