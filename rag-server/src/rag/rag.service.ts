import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { VectorStoreService } from './vector/vector-store.service';
import { LlmService } from './llm/llm.service';
import { EmbeddingService } from './services/embedding.service';
import { PrismaService } from 'prisma/prisma.service';
import { ChatRepository } from './repositories/chat.repository';
import { DocumentRepository } from './repositories/document.repository';
import { MessageRepository } from './repositories/messages.repository';
import { DocumentHandlerRegistry } from './handlers/document-handler.registry';
export interface UploadResponse {
  success: boolean;
  documentId: string;
  message: string;
  chunksProcessed: number;
  chatId: string | undefined;
}

export interface QueryResponse {
  success: boolean;
  answer: string;
  sources: Array<{
    filename: string;
    chunkIndex: number;
    content: string;
  }>;
  question: string;
  updatedTitle?: string;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private pdfService: PdfService,
    private vectorStoreService: VectorStoreService,
    private llmService: LlmService,
    private readonly prisma: PrismaService,
    private chatRepo: ChatRepository,
    private docRepo: DocumentRepository,
    private msgRepo: MessageRepository,
    private embeddingService: EmbeddingService,
    private documentHandlerRegistry: DocumentHandlerRegistry,
  ) {}

  /**
   * Complete document upload and processing pipeline
   * Now uses DocumentHandlerRegistry for extensible document type support
   * 1. Get appropriate handler from registry based on MIME type
   * 2. Validate document format
   * 3. Extract text using handler
   * 4. Split into chunks
   * 5. Save chunk count to document
   * 6. Generate embeddings and store in vector database
   * 7. Update chat document count
   *
   * @param file - Uploaded document file
   * @returns Upload result with document ID
   */
  async uploadAndProcessPdf(
    userId: string,
    chatId: string | undefined,
    file: Express.Multer.File,
  ): Promise<UploadResponse> {
    const startTime = Date.now();
    this.logger.log(
      `Starting document upload: ${file.originalname} (${file.size} bytes, type: ${file.mimetype})`,
    );

    try {
      // Step 1: Get handler from registry based on MIME type
      const handler = this.documentHandlerRegistry.getHandler(file.mimetype);

      // Step 2: Save document record
      const document = await this.docRepo.createDocument({
        userId,
        filename: file.originalname,
        storagePath: 'path',
        mimeType: file.mimetype,
        size: file.size,
      });

      // Step 3: Process document using handler (extract, validate, chunk)
      const chunks = await handler.process(file, document.id);

      // Step 4: Update document with chunk count
      await this.docRepo.updateDocument(document.id, {
        chunkCount: chunks.length,
      });
      this.logger.log(`✓ Document chunk count saved: ${chunks.length}`);

      // Step 5: Add chunks to vector store (automatically embeds and stores)
      await this.vectorStoreService.addDocuments(
        chunks,
        userId,
        document.id,
        chatId,
      );

      // Step 6: Link document to chat and update document count
      if (chatId) {
        await this.docRepo.linkDocumentToChat(chatId, document.id);
        // Increment document count in chat
        await this.chatRepo.updateChat(chatId, {
          documentCount: { increment: 1 },
        });
        this.logger.log(`✓ Incremented document count for chat ${chatId}`);
      }

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `✓ Document processed in ${processingTime}ms: ${chunks.length} chunks stored`,
      );

      return {
        success: true,
        documentId: document.id,
        message: `Document processed successfully. ${chunks.length} chunks created and stored.`,
        chunksProcessed: chunks.length,
        chatId,
      };
    } catch (error) {
      this.logger.error('Error processing document:', error);
      return {
        success: false,
        documentId: '',
        message: `Failed to process document: ${error.message}`,
        chunksProcessed: 0,
        chatId,
      };
    }
  }

  /**
   * Complete RAG query pipeline
   * 1. Embed the query
   * 2. Retrieve relevant document chunks
   * 3. Generate answer using LLM with context
   *
   * @param question - User's question
   * @param topK - Number of relevant chunks to retrieve (default: 4)
   * @returns Answer with sources
   */
  async query(
    userId: string,
    chatId: string,
    question: string,
    topK: number,
    modelProvider: string,
    modelName: string,
  ): Promise<QueryResponse> {
    const startTime = Date.now();
    this.logger.log(`Processing query: "${question}"`);

    try {
      let ChatTitle = '';
      let titleUpdated = false;
      if (!chatId) {
        const chat = await this.chatRepo.createChat(
          userId,
          this.generateTitleFromQuestion(question),
        );
        chatId = chat.id;
        ChatTitle = chat?.title;
        titleUpdated = true;
      } else {
        // Validate chat belongs to user
        const chat = await this.chatRepo.findUserChat(chatId, userId);

        await this.chatRepo.validateChatOwnership(chatId, userId);

        if (!chat) throw new ForbiddenException('Chat does not belong to user');
        ChatTitle = chat?.title;
        if (chat.title === 'New Chat') {
          const newTitle = this.generateTitleFromQuestion(question);

          await this.chatRepo.updateChatTitle(chatId, newTitle);
          ChatTitle = newTitle;
          titleUpdated = true;
        }
      }
      // Step 1: Perform similarity search to find relevant chunks
      const relevantDocs = await this.vectorStoreService.similaritySearch(
        question,
        userId,
        chatId,
        topK,
      );

      if (relevantDocs.length === 0) {
        return {
          success: false,
          answer: 'No relevant documents found. Please upload PDFs first.',
          sources: [],
          question,
        };
      }
      // Save user message before calling LLM
      await this.msgRepo.createUserMessage(chatId, userId, question);
      // Step 2: Generate answer using LLM with retrieved context
      const answer = await this.llmService.generateAnswer(
        question,
        relevantDocs,
        modelProvider,
        modelName,
      );
      // Step 3: Format sources for response
      const sources = relevantDocs.map((doc) => ({
        filename: doc.metadata.filename || 'Unknown',
        chunkIndex: doc.metadata.chunkIndex ?? 0,
        content: doc.pageContent.substring(0, 200) + '...', // Preview
      }));

      // Save the assistant reply message
      const assistantMessage = await this.msgRepo.createAssistantMessage(
        chatId,
        answer,
      );
      // Save ALL sources in ONE row
      await this.msgRepo.saveMessageSources(assistantMessage.id, sources);
      const queryTime = Date.now() - startTime;
      this.logger.log(`Query completed in ${queryTime}ms`);

      return {
        success: true,
        answer,
        sources,
        question,
        ...(titleUpdated && { updatedTitle: ChatTitle }),
      };
    } catch (error) {
      this.logger.error('Error processing query:', error);
      return {
        success: false,
        answer: `Error: ${error.message}`,
        sources: [],
        question,
      };
    }
  }

  /**
   * Streamed RAG query pipeline
   * 1. Embed the query
   * 2. Retrieve relevant document chunks
   * 3. Stream LLM answer with context
   *
   * @param question - User's question
   * @param topK - Number of relevant chunks to retrieve (default: 4)
   * @returns Async generator streaming answer chunks + final metadata
   */
  async *queryStream(
    userId: string,
    chatId: string,
    question: string,
    topK: number,
    modelProvider: string,
    modelName: string,
  ): AsyncGenerator<{ type: string; data: any }> {
    const startTime = Date.now();
    this.logger.log(`Processing streaming query: "${question}"`);

    try {
      let ChatTitle = '';
      let titleUpdated = false;
      // ----------------------------------------
      // 1. Ensure chat exists (create if null)
      // ----------------------------------------
      if (!chatId) {
        const chat = await this.chatRepo.createChat(
          userId,
          this.generateTitleFromQuestion(question),
        );
        chatId = chat.id;
        ChatTitle = chat.title;
        titleUpdated = true;
      } else {
        const chat = await this.chatRepo.findUserChat(chatId, userId);
        if (!chat) throw new ForbiddenException('Chat does not belong to user');
        ChatTitle = chat.title;

        if (chat.title === 'New Chat') {
          const newTitle = this.generateTitleFromQuestion(question);
          await this.chatRepo.updateChatTitle(chatId, newTitle);
          ChatTitle = newTitle;
          titleUpdated = true;
        }
      }
      // Save Q
      await this.msgRepo.createUserMessage(chatId, userId, question);
      const relevantDocs = await this.vectorStoreService.similaritySearch(
        question,
        userId,
        chatId,
        topK,
      );

      if (relevantDocs.length === 0) {
        yield {
          type: 'error',
          data: 'No relevant documents found. Please upload PDFs first.',
        };
        return;
      }

      // 🔥 FIXED: dynamic model switching
      const stream = this.llmService.streamAnswer(
        question,
        relevantDocs,
        modelProvider,
        modelName,
      );

      let buffer = '';
      let fullAnswer = '';
      for await (const token of stream) {
        fullAnswer += token;
        buffer += token;

        const words = buffer.split(/\s+/);

        if (words.length >= 3) {
          const completeWords = words.slice(0, -1);
          const textToSend = completeWords.join(' ') + ' ';

          if (textToSend.trim().length > 0) {
            yield { type: 'token', data: textToSend };
          }

          buffer = words[words.length - 1];
        }
      }

      if (buffer.trim().length > 0) {
        fullAnswer += ' ' + buffer;
        yield { type: 'token', data: buffer };
      }

      const sources = relevantDocs.map((doc) => ({
        filename: doc.metadata.filename || 'Unknown',
        chunkIndex: doc.metadata.chunkIndex ?? 0,
        content: doc.pageContent.substring(0, 200) + '...',
      }));

      const queryTime = Date.now() - startTime;
      // Save full streamed answer
      const assistantMsg = await this.msgRepo.createAssistantMessage(
        chatId,
        fullAnswer,
      );
      await this.msgRepo.saveMessageSources(assistantMsg.id, sources);
      yield {
        type: 'done',
        data: {
          success: true,
          question,
          sources,
          queryTime,
          ...(titleUpdated && { updatedTitle: ChatTitle }),
        },
      };
    } catch (error) {
      this.logger.error('Streaming query error:', error);
      yield { type: 'error', data: error.message };
    }
  }
  /**
   * Delete a document and all its chunks from the system
   * @param documentId - ID of document to delete
   */
  async deleteDocument(
    documentId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.vectorStoreService.deleteDocument(documentId);
      // 2. Delete chat-document relations

      await this.docRepo.unlinkDocumentFromChats(documentId);
      // 3. Delete the document row itself

      await this.docRepo.deleteDocument(documentId);
      return {
        success: true,
        message: `Document ${documentId} deleted successfully`,
      };
    } catch (error) {
      this.logger.error('Error deleting document:', error);
      return {
        success: false,
        message: `Failed to delete document: ${error.message}`,
      };
    }
  }
  async listChats(id: string) {
    return await this.chatRepo.listChats(id);
  }
  async getChatMessages(chatId: string, userId: string) {
    await this.chatRepo.validateChatOwnership(chatId, userId);
    return this.msgRepo.getChatMessages(chatId);
  }
  async getChatDocuments(chatId: string, userId: string) {
    // Ensure chat belongs to user
    const chat = await this.prisma.chatSession.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) throw new ForbiddenException('Chat does not belong to user');

    const chatDocuments = await this.prisma.chatDocument.findMany({
      where: { chatId },
      include: {
        document: true, // returns filename, size, chunkCount, etc.
      },
    });

    // Return structured response with documentCount and documents array
    return {
      chatId,
      documentCount: chat.documentCount,
      documents: chatDocuments.map((cd) => ({
        id: cd.document.id,
        filename: cd.document.filename,
        chunkCount: cd.document.chunkCount,
        mimeType: cd.document.mimeType,
        size: cd.document.size,
        createdAt: cd.document.createdAt,
      })),
    };
  }
  async deleteChat(chatId: string, userId: string) {
    await this.chatRepo.validateChatOwnership(chatId, userId);

    await this.docRepo.unlinkDocumentFromChats(chatId);

    await this.msgRepo.deleteMessagesByChatId(chatId);

    await this.chatRepo.deleteChat(chatId);
    return { success: true, message: 'Chat deleted' };
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<{
    totalDocuments: number;
    status: string;
  }> {
    try {
      const totalDocuments = await this.vectorStoreService.getDocumentCount();
      return {
        totalDocuments,
        status: 'operational',
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return {
        totalDocuments: 0,
        status: 'error',
      };
    }
  }

  /**
   * Auto-generate chat title from a question
   */
  private generateTitleFromQuestion(question: string): string {
    if (!question) return 'New Chat';

    // Take first 6–8 words as title
    const words = question.trim().split(/\s+/).slice(0, 8).join(' ');

    // Capitalize first letter
    const title = words.charAt(0).toUpperCase() + words.slice(1);

    return title.length > 60 ? title.slice(0, 60) + '...' : title;
  }
  async createChat(userId: string) {
    return this.chatRepo.createChat(userId, 'New Chat');
  }
}
