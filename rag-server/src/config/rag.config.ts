import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type LLMProvider = 'ollama' | 'groq';

@Injectable()
export class RagConfigService {
  constructor(private configService: ConfigService) {}
  // Which provider? (ollama | groq)
  get provider(): LLMProvider {
    return this.configService.get<LLMProvider>('LLM_PROVIDER', 'ollama');
  }
  // Ollama Configuration
  get ollamaBaseUrl(): string {
    return this.configService.get<string>(
      'OLLAMA_BASE_URL',
      'http://localhost:11434',
    );
  }

  get embeddingModel(): string {
    return this.configService.get<string>(
      'EMBEDDING_MODEL',
      'nomic-embed-text',
    );
  }

  get chatModel(): string {
    return this.configService.get<string>('CHAT_MODEL', 'qwen2:1.5b');
  }

  // ChromaDB Configuration
  get chromaUrl(): string {
    return this.configService.get<string>(
      'CHROMA_URL',
      'http://localhost:8000',
    );
  }

  get collectionName(): string {
    return this.configService.get<string>('COLLECTION_NAME', 'pdf_documents');
  }

  // PDF Processing Configuration
  get maxFileSize(): number {
    return this.configService.get<number>('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
  }

  get chunkSize(): number {
    return this.configService.get<number>('CHUNK_SIZE', 1000);
  }

  get chunkOverlap(): number {
    return this.configService.get<number>('CHUNK_OVERLAP', 200);
  }
  // === Groq Config ===
  get groqApiKey(): string {
    return this.configService.get<string>('GROQ_API_KEY', '');
  }
  get groqModel(): string {
    return this.configService.get<string>('GROQ_MODEL', 'llama-3.1-8b-instant');
  }
}

// // rag.config.ts
// import { registerAs } from '@nestjs/config';

// export interface RagConfig {
//   provider: string;
//   ollamaBaseUrl: string;
//   embeddingModel: string;
//   chatModel: string;
//   chromaUrl: string;
//   maxFileSize: number;
//   chunkSize: number;
//   chunkOverlap: number;
//   groqApiKey: string;
//   groqModel: string;
// }

// export const ragConfig = registerAs('rag', () => ({
//   provider: process.env.LLM_PROVIDER || 'ollama',

//   // Ollama
//   ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
//   embeddingModel: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
//   chatModel: process.env.CHAT_MODEL || 'qwen2:1.5b',

//   // ChromaDB
//   chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
//   collectionName: process.env.COLLECTION_NAME || 'pdf_documents',

//   // PDF & Chunking
//   maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
//   chunkSize: Number(process.env.CHUNK_SIZE) || 1000,
//   chunkOverlap: Number(process.env.CHUNK_OVERLAP) || 200,

//   // Groq
//   groqApiKey: process.env.GROQ_API_KEY || '',
//   groqModel: process.env.GROQ_MODEL || 'llama3-8b',
// }));
