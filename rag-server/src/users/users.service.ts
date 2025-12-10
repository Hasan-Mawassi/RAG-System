import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserResponse } from './dto/user.response.dto';
import { PasswordService } from 'src/auth/password/password.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepo: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // const hash = await bcrypt.hash(createUserDto.password, this.saltRounds);
    const hash = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    // const user = await this.prisma.user.create({
    //   data: {
    //     email: createUserDto.email,
    //     passwordHash: hash,
    //   },
    // });
    const user = await this.usersRepo.createUser(createUserDto.email, hash);
    return new UserResponse(user);
  }

  async findAll() {
    // const users = await this.prisma.user.findMany();
    const users = await this.usersRepo.findAll();
    return users.map((u) => new UserResponse(u));
  }

  async findOne(id: string) {
    // const user = await this.prisma.user.findUnique({
    //   where: { id },
    // });
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponse(user);
  }

  async findByEmail(email: string) {
    // used later by AuthService
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      data.passwordHash = await this.passwordService.hashPassword(
        updateUserDto.password,
      );
      delete data.password;
    }

    const user = await this.usersRepo.UpdateById(id, data);

    return new UserResponse(user);
  }

  async remove(id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ${id} not found`);
    }
    await this.usersRepo.Delete(id);
    return { success: true, message: 'User deleted successfully' };
  }
}
