import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private prisma: PrismaService) {}

  createChat(userId: string, title: string) {
    return this.prisma.chatSession.create({
      data: { userId, title },
    });
  }

  getChatById(chatId: string) {
    return this.prisma.chatSession.findUnique({
      where: { id: chatId },
    });
  }

  getMessages(chatId: string) {
    return this.prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  }

  updateChat(chatId: string, data: any) {
    return this.prisma.chatSession.update({
      where: { id: chatId },
      data,
    });
  }

  findUserChat(chatId: string, userId: string) {
    return this.prisma.chatSession.findFirst({
      where: { id: chatId, userId },
    });
  }

  validateChatOwnership(chatId: string, userId: string) {
    return this.findUserChat(chatId, userId).then((chat) => {
      if (!chat) throw new ForbiddenException('Chat does not belong to user');
      return chat;
    });
  }

  updateChatTitle(chatId: string, newTitle: string) {
    return this.prisma.chatSession.update({
      where: { id: chatId },
      data: { title: newTitle },
    });
  }

  listChats(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  deleteChat(chatId: string) {
    return this.prisma.chatSession.delete({ where: { id: chatId } });
  }
}
