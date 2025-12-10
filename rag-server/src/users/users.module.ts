import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { PasswordService } from 'src/auth/password/password.service';

@Module({
  providers: [UsersService, UsersRepository, PasswordService],
  controllers: [UsersController],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
