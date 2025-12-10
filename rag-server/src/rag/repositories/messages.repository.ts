import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class MessageRepository {
  constructor(private prisma: PrismaService) {}

  createUserMessage(chatId: string, userId: string, content: string) {
    return this.prisma.chatMessage.create({
      data: {
        chatId,
        userId,
        role: 'USER',
        content,
      },
    });
  }

  createAssistantMessage(chatId: string, content: string) {
    return this.prisma.chatMessage.create({
      data: {
        chatId,
        role: 'ASSISTANT',
        content,
      },
    });
  }

  saveMessageSources(messageId: string, sources: any[]) {
    return this.prisma.messageSources.create({
      data: {
        messageId,
        sourcesJson: sources,
      },
    });
  }

  getChatMessages(chatId: string) {
    return this.prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: { sources: true },
    });
  }

  deleteMessagesByChatId(chatId: string) {
    return this.prisma.chatMessage.deleteMany({ where: { chatId } });
  }
}
