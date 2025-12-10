// ============================================
// STEP 6: PDF Processing Service (src/services/pdf.service.ts)
// ============================================
// Handles PDF parsing and text chunking for optimal retrieval
// Uses RecursiveCharacterTextSplitter for intelligent text segmentation

import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { RagConfigService } from '../../config/rag.config';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(private configService: RagConfigService) {
    this.initializeTextSplitter();
  }

  /**
   * Initialize the text splitter with optimal chunk sizes
   * RecursiveCharacterTextSplitter tries to keep paragraphs and sentences together
   */
  private initializeTextSplitter() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // Maximum chunk size in characters
      chunkOverlap: 100, // Overlap between chunks to maintain context
      separators: ['\n\n', '\n', ' ', ''], // Priority order for splitting
    });

    this.logger.log(
      `Text splitter initialized with chunk size: ${this.configService.chunkSize}, overlap: ${this.configService.chunkOverlap}`,
    );
  }

  /**
   * Extract text content from PDF buffer
   * @param buffer - PDF file buffer
   * @returns Extracted text content
   */
  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);

      this.logger.log(
        `Extracted ${data.text.length} characters from PDF (${data.numpages} pages)`,
      );

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('PDF contains no extractable text');
      }

      return data.text;
    } catch (error) {
      this.logger.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Split text into optimally-sized chunks for embedding
   * @param text - Full text content
   * @param metadata - Additional metadata to attach to each chunk
   * @returns Array of Document objects ready for embedding
   */
  async splitTextIntoChunks(
    text: string,
    metadata: Record<string, any> = {},
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

      this.logger.log(`Split text into ${chunks.length} chunks`);

      // Log chunk statistics
      const avgChunkSize =
        chunks.reduce((sum, doc) => sum + doc.pageContent.length, 0) /
        chunks.length;
      this.logger.debug(
        `Average chunk size: ${Math.round(avgChunkSize)} characters`,
      );

      return chunks;
    } catch (error) {
      this.logger.error('Error splitting text into chunks:', error);
      throw new Error(`Failed to chunk text: ${error.message}`);
    }
  }

  /**
   * Process entire PDF: extract text, split into chunks, and prepare for storage
   * @param buffer - PDF file buffer
   * @param filename - Original filename
   * @returns Object containing document ID and prepared chunks
   */
  async processPdf(
    buffer: Buffer,
    filename: string,
    documentId: string,
  ): Promise<Document[]> {
    try {
      this.logger.log(`Processing PDF: ${filename}`);

      // Step 1: Extract text from PDF
      const text = await this.extractTextFromPdf(buffer);

      // Generate unique document ID
      // const documentId = uuidv4();

      // Step 2: Split into chunks with metadata
      const chunks = await this.splitTextIntoChunks(text, {
        filename,
        documentId,
        uploadDate: new Date().toISOString(),
      });

      this.logger.log(
        `Successfully processed PDF ${filename}: ${chunks.length} chunks created`,
      );

      // return { documentId, chunks };
      return chunks;
    } catch (error) {
      this.logger.error(`Error processing PDF ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Validate PDF file before processing
   * @param buffer - File buffer to validate
   * @returns True if valid PDF
   */
  validatePdf(buffer: Buffer): boolean {
    // Check PDF magic number (starts with %PDF)
    const pdfHeader = buffer.toString('ascii', 0, 4);
    return pdfHeader === '%PDF';
  }
}
