import { Module, OnModuleInit, Logger } from '@nestjs/common';
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
import { RegistriesModule } from './registries/registries.module';
import { LlmProviderRegistry } from './registries/llm-provider-registry';
import { OllamaProvider } from './providers/ollama.provider';
import { GroqProvider } from './providers/groq.provider';
import { DocumentHandlerModule } from './handlers/handlers.module';
import { DocumentHandlerRegistry } from './handlers/document-handler.registry';

@Module({
  imports: [
    RegistriesModule, // Import registry infrastructure
    DocumentHandlerModule, // Import document handlers
  ],
  controllers: [
    RagController, // REST API endpoints
  ],
  providers: [
    RagConfigService, // Configuration management
    EmbeddingService, // Ollama embeddings (nomic-embed-text)
    VectorStoreService, // ChromaDB vector storage
    PdfService, // PDF parsing and chunking
    LlmService, // LLM orchestration service
    RagService, // Main orchestrator
    ChatRepository,
    DocumentRepository,
    MessageRepository,
    // LLM Provider Implementations
    OllamaProvider, // Local Ollama models
    GroqProvider, // Groq cloud models
  ],
  exports: [
    RagService, // Export for use in other modules if needed
  ],
})
export class RagModule implements OnModuleInit {
  private readonly logger = new Logger(RagModule.name);

  constructor(
    private llmRegistry: LlmProviderRegistry,
    private documentHandlerRegistry: DocumentHandlerRegistry,
    private ollamaProvider: OllamaProvider,
    private groqProvider: GroqProvider,
  ) {}

  /**
   * OnModuleInit lifecycle hook
   * Registers LLM providers and document handlers
   * This runs after all dependencies are injected
   */
  onModuleInit(): void {
    this.logger.log('Initializing RAG Module...');

    try {
      // Register LLM providers
      this.llmRegistry.register('ollama', this.ollamaProvider);
      this.logger.log('✓ Ollama provider registered');

      this.llmRegistry.register('groq', this.groqProvider);
      this.logger.log('✓ Groq provider registered');

      const llmInfo = this.llmRegistry.getRegistryInfo();
      this.logger.log(
        `LLM Provider Registry: ${llmInfo.registered.join(', ')} [default: ${llmInfo.default}]`,
      );

      // Log document handlers (already registered in DocumentHandlerModule.onModuleInit)
      const docInfo = this.documentHandlerRegistry.getRegistryInfo();
      this.logger.log(
        `Document Handler Registry: ${docInfo.totalHandlers} handler(s) [${docInfo.supportedMimeTypes.join(', ')}]`,
      );
    } catch (error: any) {
      this.logger.error('Failed to initialize RAG module:', error);
      throw error;
    }
  }
}
