import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { RagConfigService } from '../../config/rag.config';
import { DocumentHandler } from './document-handler.interface';

/**
 * Text Document Handler
 *
 * Implements the DocumentHandler interface for processing plain text (.txt) files.
 * Responsibilities:
 * - Extract text from plain text files
 * - Handle various character encodings
 * - Split text into optimally-sized chunks for embedding
 * - Attach metadata to chunks
 * - Validate text format
 *
 * @example
 * const handler = new TextDocumentHandler(configService);
 * const documents = await handler.process(multerFile, documentId);
 *
 * @see DocumentHandler interface for method contracts
 */
@Injectable()
export class TextDocumentHandler implements DocumentHandler {
  private readonly logger = new Logger(TextDocumentHandler.name);
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(private configService: RagConfigService) {
    this.initializeTextSplitter();
  }

  /**
   * Initialize the text splitter with optimal chunk sizes
   */
  private initializeTextSplitter(): void {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.configService.chunkSize,
      chunkOverlap: this.configService.chunkOverlap,
      separators: ['\n\n', '\n', ' ', ''], // Priority order for splitting
    });

    this.logger.log(
      `✓ Initialized TXT text splitter [chunkSize=${this.configService.chunkSize}, overlap=${this.configService.chunkOverlap}]`,
    );
  }

  /**
   * Check if this handler can process a given MIME type
   * @param mimeType - MIME type to check
   * @returns True if this is a text MIME type
   */
  canHandle(mimeType: string): boolean {
    return (
      mimeType === 'text/plain' ||
      mimeType === 'text/csv' ||
      mimeType === 'application/json'
    );
  }

  /**
   * Get the MIME types this handler supports
   * @returns Array of supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    return ['text/plain', 'text/csv', 'application/json'];
  }

  /**
   * Validate if the buffer is valid text content
   * Attempts to decode buffer as UTF-8 text
   * @param buffer - File buffer to validate
   * @returns True if content appears to be valid text
   */
  validate(buffer: Buffer): boolean {
    try {
      // Attempt to decode as UTF-8
      const text = buffer.toString('utf-8');

      // Check if buffer has any readable text
      if (!text || text.trim().length === 0) {
        this.logger.warn('Text file is empty or contains no readable content');
        return false;
      }

      // Check for null bytes (binary file indicator)
      if (text.includes('\0')) {
        this.logger.warn('File appears to be binary (contains null bytes)');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.warn('Error validating text file:', error);
      return false;
    }
  }

  /**
   * Extract text content from plain text file buffer
   * Handles various character encodings (UTF-8, UTF-16, Latin-1)
   * @param buffer - Text file buffer
   * @returns Extracted text content
   * @throws Error if file cannot be decoded as text
   */
  extractText(buffer: Buffer): Promise<string> {
    try {
      // Try UTF-8 first (most common)
      let text = buffer.toString('utf-8');

      // If contains replacement character, try UTF-16
      if (text.includes('\ufffd')) {
        this.logger.debug(
          'UTF-8 decoding produced replacement chars, trying UTF-16...',
        );
        text = buffer.toString('utf-16le');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('Text file contains no readable content');
      }

      this.logger.debug(`Extracted ${text.length} characters from text file`);

      return Promise.resolve(text);
    } catch (error) {
      this.logger.error('Error extracting text from file:', error);
      throw new Error(`Failed to parse text file: ${error.message}`);
    }
  }

  /**
   * Process entire text file: extract text, split into chunks, and prepare for storage
   * @param file - Express Multer file object
   * @param documentId - ID to associate with chunks
   * @returns Array of Document objects ready for embedding
   * @throws Error if processing fails
   */
  async process(
    file: Express.Multer.File,
    documentId: string,
  ): Promise<Document[]> {
    try {
      this.logger.log(`Processing TXT: ${file.originalname}`);

      // Step 1: Validate text format
      if (!this.validate(file.buffer)) {
        throw new Error('Invalid text file format or encoding');
      }

      // Step 2: Extract text from file
      const text = await this.extractText(file.buffer);

      // Step 3: Split into chunks with metadata
      const chunks = await this.splitTextIntoChunks(text, {
        filename: file.originalname,
        documentId,
        uploadDate: new Date().toISOString(),
        mimeType: file.mimetype,
        fileSize: file.size,
      });

      this.logger.log(
        `✓ Successfully processed TXT: ${file.originalname} → ${chunks.length} chunks`,
      );

      return chunks;
    } catch (error) {
      this.logger.error(`Error processing TXT ${file.originalname}:`, error);
      throw error;
    }
  }

  /**
   * Split text into optimally-sized chunks for embedding
   * @param text - Full text content to split
   * @param metadata - Metadata to attach to each chunk
   * @returns Array of Document objects ready for embedding
   */
  private async splitTextIntoChunks(
    text: string,
    metadata: Record<string, any>,
  ): Promise<Document[]> {
    try {
      // Clean the text: remove excessive whitespace and normalize
      const cleanedText = text
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
        .trim();

      // Split into chunks using the text splitter
      const chunks = await this.textSplitter.createDocuments(
        [cleanedText],
        [metadata],
      );

      // Log chunk statistics
      const avgChunkSize =
        chunks.reduce((sum, doc) => sum + doc.pageContent.length, 0) /
        chunks.length;

      this.logger.debug(
        `Split text into ${chunks.length} chunks (avg size: ${Math.round(avgChunkSize)} chars)`,
      );

      return chunks;
    } catch (error) {
      this.logger.error('Error splitting text into chunks:', error);
      throw new Error(`Failed to chunk text: ${error.message}`);
    }
  }
}
