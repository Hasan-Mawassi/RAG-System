import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(email: string, passwordHash: string): Promise<User> {
    return await this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async UpdateById(id: string, data: any): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async Delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
