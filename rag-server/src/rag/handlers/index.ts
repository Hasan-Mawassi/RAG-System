/**
 * Document Handler Barrel Exports
 *
 * Provides clean imports for all document handler related modules
 *
 * @example
 * import { DocumentHandlerRegistry, PdfDocumentHandler } from './handlers';
 */

export type { DocumentHandler } from './document-handler.interface';
export { DocumentHandlerRegistry } from './document-handler.registry';
export { PdfDocumentHandler } from './pdf.handler';
export { DocxDocumentHandler } from './docx.handler';
export { TextDocumentHandler } from './text.handler';
export { XlsxDocumentHandler } from './xlsx.handler';
export { DocumentHandlerModule } from './handlers.module';
