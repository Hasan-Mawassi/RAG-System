import { Module } from '@nestjs/common';
import { LlmProviderRegistry } from './llm-provider-registry';

/**
 * Registries Module
 *
 * Centralizes all provider registry exports
 * Registries manage runtime registration and retrieval of provider implementations
 *
 * Current Registries:
 * - LlmProviderRegistry: Manages LLM providers (Ollama, Groq, Claude, etc.)
 *
 * Future Registries:
 * - DocumentHandlerRegistry: Manage document processors (PDF, DOCX, TXT, etc.)
 * - EmbeddingProviderRegistry: Manage embedding services
 * - VectorStoreRegistry: Manage vector databases
 */
@Module({
  providers: [LlmProviderRegistry],
  exports: [LlmProviderRegistry],
})
export class RegistriesModule {}
