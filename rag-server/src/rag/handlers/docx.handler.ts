import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as mammoth from 'mammoth';
import { RagConfigService } from '../../config/rag.config';
import { DocumentHandler } from './document-handler.interface';

/**
 * DOCX Document Handler
 *
 * Implements the DocumentHandler interface for processing Microsoft Word (.docx) files.
 * Responsibilities:
 * - Extract text from DOCX using docx library
 * - Split text into optimally-sized chunks for embedding
 * - Attach metadata to chunks
 * - Validate DOCX format
 *
 * @example
 * const handler = new DocxDocumentHandler(configService);
 * const documents = await handler.process(multerFile, documentId);
 *
 * @note Requires: npm install docx-parser (or similar DOCX library)
 *
 * @see DocumentHandler interface for method contracts
 */
@Injectable()
export class DocxDocumentHandler implements DocumentHandler {
  private readonly logger = new Logger(DocxDocumentHandler.name);
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
      `✓ Initialized DOCX text splitter [chunkSize=${this.configService.chunkSize}, overlap=${this.configService.chunkOverlap}]`,
    );
  }

  /**
   * Check if this handler can process a given MIME type
   * @param mimeType - MIME type to check
   * @returns True if this is a DOCX MIME type
   */
  canHandle(mimeType: string): boolean {
    return (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  }

  /**
   * Get the MIME types this handler supports
   * @returns Array of supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    return [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
  }

  /**
   * Validate if the buffer is a valid DOCX
   * DOCX files are ZIP archives with specific structure
   * Checks for ZIP file header (PK)
   * @param buffer - File buffer to validate
   * @returns True if valid DOCX
   */
  validate(buffer: Buffer): boolean {
    // DOCX files are ZIP archives - check for ZIP file header (PK)
    const zipHeader = buffer.toString('ascii', 0, 2);
    const isValid = zipHeader === 'PK';

    if (!isValid) {
      this.logger.warn('Invalid DOCX format: missing ZIP file header');
    }

    return isValid;
  }

  /**
   * Extract text content from DOCX buffer using mammoth library
   * @param buffer - DOCX file buffer
   * @returns Extracted text content
   * @throws Error if DOCX parsing fails
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });

      if (!result.value) {
        throw new Error('No text content found in DOCX file');
      }

      this.logger.log('✓ Successfully extracted text from DOCX');
      return result.value;
    } catch (error) {
      this.logger.error('Error extracting text from DOCX:', error);
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
  }

  /**
   * Process entire DOCX: extract text, split into chunks, and prepare for storage
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
      this.logger.log(`Processing DOCX: ${file.originalname}`);

      // Step 1: Validate DOCX format
      if (!this.validate(file.buffer)) {
        throw new Error('Invalid DOCX file format');
      }

      // Step 2: Extract text from DOCX
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
        `✓ Successfully processed DOCX: ${file.originalname} → ${chunks.length} chunks`,
      );

      return chunks;
    } catch (error) {
      this.logger.error(`Error processing DOCX ${file.originalname}:`, error);
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
