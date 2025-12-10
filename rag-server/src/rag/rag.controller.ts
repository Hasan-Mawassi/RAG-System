import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Param,
  Query,
  MessageEvent,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService, UploadResponse } from './rag.service';
import { QueryDto } from './dto/query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UploadResponseDto } from './dto/upload-response.dto';
import { QueryResponseDto } from './dto/query-response.dto';
import { DocumentDto } from './dto/document.dto';
import { ChatDto } from './dto/chat.dto';
import { MessageDto } from './dto/message.dto';
import { StatsDto } from './dto/stats.dto';
import { StreamEventDto } from './dto/stream-event.dto';

import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('RAG System')
@ApiBearerAuth()
@Controller('api/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  /**
   * POST /api/rag/upload
   * Upload a PDF document and process it into embeddings
   *
   * @example
   * curl -X POST http://localhost:3000/api/rag/upload \
   *   -F "file=@document.pdf"
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Upload and process a PDF document',
    description:
      'Uploads a PDF, extracts text, generates embeddings, and links it to a user chat. If chatId is missing, a new chat is created.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'PDF upload',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        chatId: { type: 'string', nullable: true },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'PDF successfully uploaded and processed.',
    type: UploadResponseDto,
    schema: {
      example: {
        documentId: 'doc_123',
        chatId: 'chat_456',
        processed: true,
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid file or parameters.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(
            new HttpException('Only PDF files allowed', HttpStatus.BAD_REQUEST),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadPdf(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('chatId') chatId?: string,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    // ⭐ If chatId is missing → create new chat
    if (!chatId) {
      const newChat = await this.ragService.createChat(req.user.id);
      chatId = newChat.id;
    }
    return this.ragService.uploadAndProcessPdf(req.user.id, chatId, file);
  }

  /**
   * POST /api/rag/query
   * Ask a question based on uploaded documents
   *
   * @example
   * curl -X POST http://localhost:3000/api/rag/query \
   *   -H "Content-Type: application/json" \
   *   -d '{"question": "What is the main topic?", "topK": 4}'
   */
  @Post('query')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Ask a question (non-streaming)',
    description:
      'Queries the vector database, retrieves relevant chunks, sends them to the AI model, and stores the message in chat history.',
  })
  @ApiBody({
    type: QueryDto,
    description: 'Query payload',
    examples: {
      example1: {
        summary: 'Basic Query',
        value: {
          question: 'What is the main topic?',
          modelProvider: 'ollama',
          modelName: 'qwen2:1.5b',
          topK: 5,
          chatId: 'chat_123',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Answer successfully generated.',
    type: QueryResponseDto,
    schema: {
      example: {
        answer: 'The document discusses...',
        citations: [],
        chatId: 'chat_123',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.' })
  async query(
    @Req() req,
    @Body('chatId') chatId: string,
    @Body() body: QueryDto,
  ): Promise<QueryResponseDto> {
    const { question, topK, modelName, modelProvider } = body;

    if (!question || question.trim().length === 0) {
      throw new HttpException('Question is required', HttpStatus.BAD_REQUEST);
    }

    const k = topK || 4;
    if (k < 1 || k > 10) {
      throw new HttpException(
        'topK must be between 1 and 10',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!modelProvider) {
      throw new HttpException(
        'modelProvider is required (e.g., ollama, groq)',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!modelName) {
      throw new HttpException(
        'modelName is required (e.g. qwen2:1.5b)',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.ragService.query(
      req.user.id,
      chatId,
      body.question,
      body.topK,
      body.modelProvider,
      body.modelName,
    );
  }
  /**
   * Streaming version of query (Server-Sent Events - SSE)
   * Protected: YES (JWT)
   *
   */
  @Get('stream')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Streaming query (SSE)',
    description:
      'Streams the LLM response token-by-token. Useful for real-time chat experiences.',
  })
  @ApiQuery({ name: 'chatId', required: false })
  @ApiQuery({ name: 'q', example: 'Summarize the introduction.' })
  @ApiQuery({
    name: 'topK',
    required: false,
    example: 4,
    description: 'Number of retrieved chunks (1–10)',
  })
  @ApiQuery({ name: 'modelProvider', example: 'ollama' })
  @ApiQuery({ name: 'modelName', example: 'qwen2:1.5b' })
  @ApiOkResponse({
    description: 'SSE stream initialized',
    type: StreamEventDto,
  })
  async streamQuery(
    @Query('chatId') chatId: string,
    @Query('q') question: string,
    @Query('topK') topK: number = 4,
    @Query('modelProvider') modelProvider: string,
    @Query('modelName') modelName: string,
    @Res() res,
    @Req() req,
  ) {
    if (!question || question.trim().length === 0) {
      throw new HttpException('Question is required', HttpStatus.BAD_REQUEST);
    }

    if (!modelProvider) {
      throw new HttpException(
        'modelProvider is required (e.g., ollama, groq)',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!modelName) {
      throw new HttpException(
        'modelName is required (e.g. qwen2:1.5b)',
        HttpStatus.BAD_REQUEST,
      );
    }

    const k = topK || 4;
    if (k < 1 || k > 10) {
      throw new HttpException(
        'topK must be between 1 and 10',
        HttpStatus.BAD_REQUEST,
      );
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = this.ragService.queryStream(
      req.user.id,
      chatId,
      question,
      k,
      modelProvider,
      modelName,
    );

    for await (const event of stream) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.end();
  }
  /**
   * DELETE /api/rag/document/:documentId
   * Delete a specific document from the system
   *
   * @example
   * curl -X DELETE http://localhost:3000/api/rag/document/abc-123-def
   */
  @Delete('document/:documentId')
  @ApiOperation({
    summary: 'Delete a processed document',
    description:
      'Deletes a PDF and its embeddings from the vector database and storage.',
  })
  @ApiParam({ name: 'documentId', example: 'doc_123' })
  @ApiOkResponse({
    schema: { example: { success: true } },
  })
  @ApiNotFoundResponse({ description: 'Document not found.' })
  async deleteDocument(@Param('documentId') documentId: string) {
    if (!documentId) {
      throw new HttpException(
        'Document ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.ragService.deleteDocument(documentId);
  }
  /**
   * Get all documents uploaded inside a specific chat
   * Protected: YES (JWT)
   */
  @Get('/chats/:chatId/documents')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get documents attached to a chat',
  })
  @ApiParam({ name: 'chatId', example: 'chat_123' })
  @ApiOkResponse({ type: DocumentDto, isArray: true })
  async getChatDocuments(@Req() req, @Param('chatId') chatId: string) {
    return await this.ragService.getChatDocuments(chatId, req.user.id);
  }
  /**
   * DELETE /api/rag/chats/:chatId
   * Delete an entire chat (messages + documents mapping)
   * Protected: YES
   */
  @Delete('/chats/:chatId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete an entire chat session',
  })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @UseGuards(JwtAuthGuard)
  async deleteChat(@Req() req, @Param('chatId') chatId: string) {
    return await this.ragService.deleteChat(chatId, req.user.id);
  }

  /**
   * GET /api/rag/stats
   * Get system statistics
   *
   * @example
   * curl http://localhost:3000/api/rag/stats
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get RAG system statistics',
  })
  @ApiOkResponse({
    description: 'System stats retrieved.',
    type: StatsDto,
  })
  async getStats() {
    return await this.ragService.getSystemStats();
  }
  /**
   * GET /api/rag/chats
   * List all chats belonging to the current user
   * Protected: YES
   * Example:
   *   curl http://localhost:3000/api/rag/chats
   */
  @Get('/chats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all chats for the current user' })
  @ApiOkResponse({ type: ChatDto, isArray: true })
  async listChats(@Req() req) {
    return await this.ragService.listChats(req.user.id);
  }
  /**
   * GET /api/rag/chats/:chatId/messages
   * Get all messages for a given chat
   * Protected: YES
   *
   * Example:
   *   curl http://localhost:3000/api/rag/chats/1/messages
   */
  @Get('/chats/:chatId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all messages from a chat' })
  @ApiParam({ name: 'chatId', example: 'chat_1' })
  @ApiOkResponse({ type: MessageDto, isArray: true })
  async getMessages(@Req() req, @Param('chatId') chatId: string) {
    return await this.ragService.getChatMessages(chatId, req.user.id);
  }
  /**
   * POST /api/rag/chat
   * Create a new empty chat
   * Protected: YES
   *
   * Response:
   *   {
   *     id: "chat_01",
   *     createdAt: "..."
   *   }
   *
   * Example:
   *   curl -X POST http://localhost:3000/api/rag/chat
   */
  @Post('/chat')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new empty chat' })
  @ApiCreatedResponse({ type: ChatDto })
  async createChat(@Req() req) {
    return await this.ragService.createChat(req.user.id);
  }
  /**
   * GET /api/rag/health
   * Simple health check
   *
   * Response:
   *   {
   *     status: "ok",
   *     timestamp: "...",
   *     service: "RAG System"
   *   }
   *
   * Example:
   *   curl http://localhost:3000/api/rag/health
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check for monitoring' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        service: 'RAG System',
        timestamp: '2025-01-08T10:00:00Z',
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'RAG System',
    };
  }
}
