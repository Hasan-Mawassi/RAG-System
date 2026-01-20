import { Module, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { DocumentHandlerRegistry } from './document-handler.registry';
import { PdfDocumentHandler } from './pdf.handler';
import { DocxDocumentHandler } from './docx.handler';
import { TextDocumentHandler } from './text.handler';
import { XlsxDocumentHandler } from './xlsx.handler';
import { RagConfigService } from '../../config/rag.config';

/**
 * Document Handler Module
 *
 * NestJS module for managing document handlers.
 * Responsible for:
 * - Registering all document handler implementations
 * - Initializing the DocumentHandlerRegistry
 * - Providing handlers to other modules
 *
 * Handlers are automatically registered during module initialization (OnModuleInit).
 *
 * @example
 * @Module({
 *   imports: [DocumentHandlerModule],
 *   providers: [RagService],
 * })
 * export class RagModule {}
 *
 * // In a service:
 * constructor(private handlerRegistry: DocumentHandlerRegistry) {}
 *
 * async uploadDocument(file: Express.Multer.File) {
 *   const handler = this.handlerRegistry.getHandler(file.mimetype);
 *   const documents = await handler.process(file, documentId);
 * }
 */
@Module({
  providers: [
    RagConfigService,
    DocumentHandlerRegistry,
    PdfDocumentHandler,
    DocxDocumentHandler,
    TextDocumentHandler,
    XlsxDocumentHandler,
  ],
  exports: [DocumentHandlerRegistry],
})
export class DocumentHandlerModule implements OnModuleInit {
  private readonly logger = new Logger(DocumentHandlerModule.name);

  constructor(
    private handlerRegistry: DocumentHandlerRegistry,
    private pdfHandler: PdfDocumentHandler,
    private docxHandler: DocxDocumentHandler,
    private textHandler: TextDocumentHandler,
    private xlsxHandler: XlsxDocumentHandler,
  ) {}

  /**
   * Initialize the module by registering all document handlers
   * This runs after all providers are instantiated
   */
  onModuleInit(): void {
    this.logger.log('Initializing document handlers...');

    try {
      // Register PDF handler
      this.handlerRegistry.register(this.pdfHandler, ['application/pdf']);
      this.logger.log('✓ PDF handler registered');

      // Register DOCX handler
      this.handlerRegistry.register(this.docxHandler, [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]);
      this.logger.log('✓ DOCX handler registered');

      // Register Text handlers (plain text, CSV, JSON)
      this.handlerRegistry.register(this.textHandler, [
        'text/plain',
        'text/csv',
        'application/json',
      ]);
      this.logger.log('✓ Text handler registered (plain text, CSV, JSON)');

      // Register XLSX handler
      this.handlerRegistry.register(this.xlsxHandler, [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]);
      this.logger.log('✓ XLSX handler registered');

      // Log registry info
      const info = this.handlerRegistry.getRegistryInfo();
      this.logger.log(
        `✓ Document Handler Registry initialized with ${info.totalHandlers} handler(s)`,
      );
      this.logger.log(
        `  Supported MIME types: ${info.supportedMimeTypes.join(', ')}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize document handlers:', error);
      throw error;
    }
  }
}
