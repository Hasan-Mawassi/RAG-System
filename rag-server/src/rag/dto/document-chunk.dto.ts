/**
 * Document Chunk DTOs
 */

export class DocumentChunkDto {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class DocumentWithChunksDto {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  chunks: DocumentChunkDto[];
  chunkCount: number;
  createdAt: Date;
}

export class ChatDocumentsDto {
  chatId: string;
  documentCount: number;
  documents: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    chunkCount: number;
    createdAt: Date;
  }>;
}

export class ChunkPaginationDto {
  chunks: DocumentChunkDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
