import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as XLSX from 'xlsx';
import { RagConfigService } from '../../config/rag.config';
import { DocumentHandler } from './document-handler.interface';

/**
 * XLSX Document Handler
 *
 * Implements the DocumentHandler interface for processing Microsoft Excel (.xlsx) files.
 * Responsibilities:
 * - Extract text from all sheets in XLSX
 * - Convert table data to readable text format
 * - Split text into optimally-sized chunks for embedding
 * - Attach metadata to chunks
 * - Validate XLSX format
 *
 * @example
 * const handler = new XlsxDocumentHandler(configService);
 * const documents = await handler.process(multerFile, documentId);
 *
 * @note Requires: npm install xlsx
 *
 * @see DocumentHandler interface for method contracts
 */
@Injectable()
export class XlsxDocumentHandler implements DocumentHandler {
  private readonly logger = new Logger(XlsxDocumentHandler.name);
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
      `✓ Initialized XLSX text splitter [chunkSize=${this.configService.chunkSize}, overlap=${this.configService.chunkOverlap}]`,
    );
  }

  /**
   * Check if this handler can process a given MIME type
   * @param mimeType - MIME type to check
   * @returns True if this is an XLSX MIME type
   */
  canHandle(mimeType: string): boolean {
    return (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  }

  /**
   * Get the MIME types this handler supports
   * @returns Array of supported MIME types
   */
  getSupportedMimeTypes(): string[] {
    return [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
  }

  /**
   * Validate if the buffer is a valid XLSX
   * XLSX files are ZIP archives with specific structure
   * Checks for ZIP file header (PK)
   * @param buffer - File buffer to validate
   * @returns True if valid XLSX
   */
  validate(buffer: Buffer): boolean {
    // XLSX files are ZIP archives - check for ZIP file header (PK)
    const zipHeader = buffer.toString('ascii', 0, 2);
    const isValid = zipHeader === 'PK';

    if (!isValid) {
      this.logger.warn('Invalid XLSX format: missing ZIP file header');
    }

    return isValid;
  }

  /**
   * Extract text content from XLSX buffer using xlsx library
   * Processes all sheets and converts table data to readable text
   * @param buffer - XLSX file buffer
   * @returns Extracted text content from all sheets
   * @throws Error if XLSX parsing fails
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async extractText(buffer: Buffer): Promise<string> {
    try {
      // Parse the workbook from buffer
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      // Extract text from all sheets
      const sheetTexts: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        // Convert sheet to CSV format for readable text
        const csv = XLSX.utils.sheet_to_csv(sheet);
        // Add sheet name as header
        if (csv.trim()) {
          sheetTexts.push(`\n\n=== Sheet: ${sheetName} ===\n\n${csv}`);
        }
      }

      const fullText = sheetTexts.join('\n');

      if (!fullText.trim()) {
        throw new Error('No content found in XLSX file');
      }

      this.logger.log(
        `✓ Successfully extracted text from XLSX (${workbook.SheetNames.length} sheets)`,
      );

      return fullText;
    } catch (error) {
      this.logger.error('Error extracting text from XLSX:', error);
      throw new Error(`Failed to parse XLSX: ${error.message}`);
    }
  }

  /**
   * Process entire XLSX: extract text, split into chunks, and prepare for storage
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
      this.logger.log(`Processing XLSX: ${file.originalname}`);

      // Step 1: Validate XLSX format
      if (!this.validate(file.buffer)) {
        throw new Error('Invalid XLSX file format');
      }

      // Step 2: Extract text from XLSX
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
        `✓ Successfully processed XLSX: ${file.originalname} → ${chunks.length} chunks`,
      );

      return chunks;
    } catch (error) {
      this.logger.error(`Error processing XLSX ${file.originalname}:`, error);
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
