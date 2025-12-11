import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';
import { RagConfigService } from '../../config/rag.config';
import { EmbeddingService } from '../services/embedding.service';

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private readonly logger = new Logger(VectorStoreService.name);
  private chromaClient: ChromaClient;
  private collection: Collection;
  private vectorStore: Chroma;

  constructor(
    private configService: RagConfigService,
    private embeddingService: EmbeddingService,
  ) {}

  /**
   * Initialize ChromaDB connection and create/get collection
   * Runs automatically when the module starts
   */
  async onModuleInit() {
    await this.initializeChroma();
  }

  private async initializeChroma() {
    try {
      // Initialize ChromaDB client
      this.chromaClient = new ChromaClient({
        path: this.configService.chromaUrl,
      });

      // Create or get collection for storing document vectors
      this.collection = await this.chromaClient.getOrCreateCollection({
        name: this.configService.collectionName,
        metadata: {
          description: 'PDF document embeddings',
          'hnsw:space': 'cosine', // Use cosine similarity for search
        },
      });

      // Initialize LangChain's Chroma wrapper for easier integration
      this.vectorStore = await Chroma.fromExistingCollection(
        this.embeddingService.getEmbeddingModel(),
        {
          collectionName: this.configService.collectionName,
          url: this.configService.chromaUrl,
        },
      );

      this.logger.log('ChromaDB initialized successfully');
      const count = await this.collection.count();
      this.logger.log(`Collection contains ${count} documents`);
    } catch (error) {
      this.logger.error('Failed to initialize ChromaDB:', error);
      throw error;
    }
  }

  /**
   * Add documents to the vector store
   * Each document is split into chunks, embedded, and stored
   * @param documents - Array of LangChain Document objects
   * @param documentId - Unique identifier for the source document
   */
  async addDocuments(
    documents: Document[],
    userId: string,
    documentId: string,
    chatId?: string,
  ): Promise<void> {
    try {
      // Add metadata to each document chunk
      const docsWithMetadata = documents.map((doc, index) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          userId,
          // ownerKey: chatId ? `${userId}::${chatId}` : `${userId}`,
          documentId,
          chatId: chatId ?? undefined,
          chunkIndex: index,
          timestamp: new Date().toISOString(),
        },
      }));

      // Store documents with embeddings in ChromaDB
      await this.vectorStore.addDocuments(docsWithMetadata);

      this.logger.log(
        `Added ${documents.length} chunks for document ${documentId}`,
      );
    } catch (error) {
      this.logger.error('Error adding documents to vector store:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to add documents: ${errorMessage}`);
    }
  }

  /**
   * Perform similarity search to find relevant document chunks
   * @param query - User's question or search text
   * @param k - Number of similar documents to retrieve (default: 4)
   * @returns Array of relevant document chunks with similarity scores
   */
  async similaritySearch(
    query: string,
    userId: string,
    chatId?: string,
    k: number = 4,
  ): Promise<Document[]> {
    try {
      let filter: any;

      if (chatId) {
        // Per-chat filtering → use $and
        filter = {
          $and: [
            { userId: userId }, // equivalent to { userId: { $eq: userId } }
            { chatId: chatId },
          ],
        };
      } else {
        // Only filter by userId
        filter = { userId: userId };
      }

      const results = await this.vectorStore.similaritySearch(query, k, filter);

      this.logger.log(
        `Found ${results.length} docs (user=${userId}, chat=${chatId})`,
      );
      return results;
    } catch (error) {
      this.logger.error('Error performing similarity search:', error);
      throw new Error(`Similarity search failed: ${error.message}`);
    }
  }

  /**
   * Delete all chunks associated with a specific document
   * @param documentId - ID of the document to remove
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await this.collection.delete({
        where: { documentId },
      });

      this.logger.log(`Deleted document ${documentId} from vector store`);
    } catch (error) {
      this.logger.error('Error deleting document:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete document: ${errorMessage}`);
    }
  }

  /**
   * Get the total count of document chunks in the collection
   */
  async getDocumentCount(): Promise<number> {
    return await this.collection.count();
  }

  /**
   * Get the LangChain vector store instance for advanced operations
   */
  getVectorStore(): Chroma {
    return this.vectorStore;
  }
}
