import { Injectable, Logger } from '@nestjs/common';
import { OllamaEmbeddings } from '@langchain/ollama';
import { RagConfigService } from '../../config/rag.config';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private embeddings: OllamaEmbeddings;

  constructor(private configService: RagConfigService) {
    this.initializeEmbeddings();
  }

  /**
   * Initialize Ollama embeddings with nomic-embed-text model
   * This model creates 768-dimensional vectors optimized for retrieval
   */
  private initializeEmbeddings() {
    this.embeddings = new OllamaEmbeddings({
      model: this.configService.embeddingModel,
      baseUrl: this.configService.ollamaBaseUrl,
    });

    this.logger.log(
      `Embedding service initialized with model: ${this.configService.embeddingModel}`,
    );
  }

  /**
   * Generate embeddings for a single text
   * @param text - Input text to embed
   * @returns Vector representation of the text
   */
  async embedText(text: string): Promise<number[]> {
    try {
      const embedding = await this.embeddings.embedQuery(text);
      this.logger.debug(
        `Generated embedding for text of length ${text.length}`,
      );
      return embedding;
    } catch (error) {
      this.logger.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * More efficient than calling embedText multiple times
   * @param texts - Array of texts to embed
   * @returns Array of vector representations
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    try {
      const embeddings = await this.embeddings.embedDocuments(texts);
      this.logger.log(`Generated ${embeddings.length} embeddings`);
      return embeddings;
    } catch (error) {
      this.logger.error('Error generating batch embeddings:', error);
      throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
  }

  /**
   * Get the embedding model instance for direct use with LangChain
   */
  getEmbeddingModel(): OllamaEmbeddings {
    return this.embeddings;
  }
}
