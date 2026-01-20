import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { RagConfigService } from '../../config/rag.config';
import { DocumentHandler } from './document-handler.interface';

/**
 * PDF Document Handler
 *
 * Implements the DocumentHandler interface for processing PDF files.
 * Responsibilities:
 * - Extract text from PDF buffers using pdf-parse
 * - Split text into optimally-sized chunks for embedding
 * - Attach metadata to chunks
 * - Validate PDF format
 *
 * @example
 * const handler = new PdfDocumentHandler(configService);
 * const documents = await handler.process(multerFile, documentId);
 *
 * @see DocumentHandler interface for method contracts
 */
@Injectable()
export class PdfDocumentHandler implements DocumentHandler {
  private readonly logger = new Logger(PdfDocumentHandler.name);
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(private configService: RagConfigService) {
    this.initializeTextSplitter();
  }

  /**
   * Initialize the text splitter with optimal chunk sizes
   * RecursiveCharacterTextSplitter tries to keep paragraphs and sentences together
   */
  private initializeTextSplitter(): void {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.configService.chunkSize,
      chunkOverlap: this.configService.chunkOverlap,
      separators: ['\n\n', '\n', ' ', ''], // Priority order for splitting
    });

    this.logger.log(
      `✓ Initialized PDF text splitter [chunkSize=${this.configService.chunkSize}, overlap=${this.configService.chunkOverlap}]`,
    );
  }

  /**
   * Check if this handler can process a given MIME type
   * @param mimeType - MIME type to check
   * @returns True if this is a PDF MIME type
   */
  canHandle(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  /**
   * Get the MIME types this handler supports
   * @returns Array of supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    return ['application/pdf'];
  }

  /**
   * Validate if the buffer is a valid PDF
   * Checks for PDF magic number (%PDF)
   * @param buffer - File buffer to validate
   * @returns True if valid PDF
   */
  validate(buffer: Buffer): boolean {
    const pdfHeader = buffer.toString('ascii', 0, 4);
    const isValid = pdfHeader === '%PDF';

    if (!isValid) {
      this.logger.warn('Invalid PDF format: missing PDF header');
    }

    return isValid;
  }

  /**
   * Extract text content from PDF buffer
   * @param buffer - PDF file buffer
   * @returns Extracted text content
   * @throws Error if PDF parsing fails
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF contains no extractable text');
      }

      this.logger.debug(
        `Extracted ${data.text.length} chars from PDF (${data.numpages} pages)`,
      );

      return data.text;
    } catch (error) {
      this.logger.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Process entire PDF: extract text, split into chunks, and prepare for storage
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
      this.logger.log(`Processing PDF: ${file.originalname}`);

      // Step 1: Validate PDF format
      if (!this.validate(file.buffer)) {
        throw new Error('Invalid PDF file format');
      }

      // Step 2: Extract text from PDF
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
        `✓ Successfully processed PDF: ${file.originalname} → ${chunks.length} chunks`,
      );

      return chunks;
    } catch (error) {
      this.logger.error(`Error processing PDF ${file.originalname}:`, error);
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
