// ============================================
// STEP 10: RAG Module (src/modules/rag.module.ts)
// ============================================
// NestJS module that bundles all RAG components together
// Uses dependency injection to wire up services

import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { PdfService } from './services/pdf.service';
import { VectorStoreService } from './vector/vector-store.service';
import { EmbeddingService } from './services/embedding.service';
import { LlmService } from './llm/llm.service';
import { RagConfigService } from '../config/rag.config';
import { ChatRepository } from './repositories/chat.repository';
import { DocumentRepository } from './repositories/document.repository';
import { MessageRepository } from './repositories/messages.repository';

@Module({
  controllers: [
    RagController, // REST API endpoints
  ],
  providers: [
    RagConfigService, // Configuration management
    EmbeddingService, // Ollama embeddings (nomic-embed-text)
    VectorStoreService, // ChromaDB vector storage
    PdfService, // PDF parsing and chunking
    LlmService, // Ollama LLM (qwen2:1.5b)
    RagService, // Main orchestrator
    ChatRepository,
    DocumentRepository,
    MessageRepository,
  ],
  exports: [
    RagService, // Export for use in other modules if needed
  ],
})
export class RagModule {}
