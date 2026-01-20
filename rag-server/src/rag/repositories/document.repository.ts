import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DocumentRepository {
  constructor(private prisma: PrismaService) {}

  createDocument(data: {
    userId: string;
    filename: string;
    storagePath: string;
    mimeType: string;
    size: number;
  }) {
    return this.prisma.document.create({ data });
  }

  getDocumentById(documentId: string) {
    return this.prisma.document.findUnique({
      where: { id: documentId },
    });
  }

  getDocumentsByChat(chatId: string) {
    return this.prisma.document.findMany({
      where: {
        chatLinks: {
          some: { chatId },
        },
      },
    });
  }

  updateDocument(documentId: string, data: any) {
    return this.prisma.document.update({
      where: { id: documentId },
      data,
    });
  }

  getChatsByDocument(documentId: string) {
    return this.prisma.chatDocument.findMany({
      where: { documentId },
    });
  }

  linkDocumentToChat(chatId: string, documentId: string) {
    return this.prisma.chatDocument.create({
      data: { chatId, documentId },
    });
  }

  getDocumentCount() {
    return this.prisma.document.count();
  }

  deleteDocument(documentId: string) {
    return this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  unlinkDocumentFromChats(documentId: string) {
    return this.prisma.chatDocument.deleteMany({
      where: { documentId },
    });
  }
}
