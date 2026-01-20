import { Document } from '@langchain/core/documents';

/**
 * DocumentHandler Interface
 *
 * Defines the contract that all document handlers must implement.
 * Handlers are responsible for processing specific document types (PDF, DOCX, TXT, etc.)
 * and converting them into LangChain Document objects ready for embedding.
 *
 * @example
 * const handler = registry.getHandler('application/pdf');
 * const documents = await handler.process(file);
 */
export interface DocumentHandler {
  /**
   * Check if this handler can process the given MIME type
   * @param mimeType - MIME type to check (e.g., 'application/pdf')
   * @returns True if this handler can process this MIME type
   */
  canHandle(mimeType: string): boolean;

  /**
   * Extract text content from document buffer
   * @param buffer - File buffer containing document data
   * @returns Extracted text content
   */
  extractText(buffer: Buffer): Promise<string>;

  /**
   * Process document file into chunks ready for vector storage
   * @param file - Express Multer file object
   * @param documentId - ID to associate with chunks
   * @returns Array of Document objects with metadata
   */
  process(file: Express.Multer.File, documentId: string): Promise<Document[]>;

  /**
   * Validate if the buffer is a valid document of this type
   * @param buffer - File buffer to validate
   * @returns True if valid document format
   */
  validate(buffer: Buffer): boolean;

  /**
   * Get the MIME types this handler supports
   * @returns Array of supported MIME types
   */
  getSupportedMimeTypes(): string[];
}
