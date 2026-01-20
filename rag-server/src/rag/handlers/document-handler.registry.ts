import { Injectable, Logger } from '@nestjs/common';
import { DocumentHandler } from './document-handler.interface';

/**
 * Document Handler Registry
 *
 * Centralized registry for managing document handlers.
 * Maintains a map of MIME types to handlers, enabling:
 * - Dynamic handler registration for new document types
 * - Runtime handler discovery without hardcoded logic
 * - Easy testing by registering mock handlers
 *
 * @example
 * // Register a handler
 * registry.register(pdfHandler, ['application/pdf']);
 * registry.register(docxHandler, ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
 *
 * // Get handler for a MIME type
 * const handler = registry.getHandler('application/pdf');
 * const documents = await handler.process(file, documentId);
 *
 * // Check available handlers
 * const types = registry.getSupportedMimeTypes();
 */
@Injectable()
export class DocumentHandlerRegistry {
  private readonly handlers = new Map<string, DocumentHandler>();
  private readonly logger = new Logger(DocumentHandlerRegistry.name);

  /**
   * Register a document handler for one or more MIME types
   * @param handler - DocumentHandler implementation
   * @param mimeTypes - Array of MIME types this handler supports
   */
  register(handler: DocumentHandler, mimeTypes: string[]): void {
    if (!handler) {
      throw new Error('Handler cannot be undefined');
    }

    if (!mimeTypes || mimeTypes.length === 0) {
      throw new Error('At least one MIME type must be specified');
    }

    mimeTypes.forEach((mimeType) => {
      if (this.handlers.has(mimeType)) {
        this.logger.warn(`Overwriting handler for MIME type: ${mimeType}`);
      }
      this.handlers.set(mimeType, handler);
    });

    this.logger.log(
      `✓ Registered handler for MIME types: ${mimeTypes.join(', ')}`,
    );
  }

  /**
   * Unregister a handler for a specific MIME type
   * @param mimeType - MIME type to unregister
   */
  unregister(mimeType: string): void {
    if (!this.handlers.has(mimeType)) {
      this.logger.warn(
        `Attempted to unregister non-existent handler for: ${mimeType}`,
      );
      return;
    }

    this.handlers.delete(mimeType);
    this.logger.log(`Unregistered handler for MIME type: ${mimeType}`);
  }

  /**
   * Get a handler for a specific MIME type
   * @param mimeType - MIME type to get handler for
   * @returns DocumentHandler implementation
   * @throws Error if no handler found for the MIME type
   */
  getHandler(mimeType: string): DocumentHandler {
    const handler = this.handlers.get(mimeType);

    if (!handler) {
      const available = Array.from(this.handlers.keys());
      throw new Error(
        `No handler found for MIME type: ${mimeType}. Available types: ${available.join(', ') || 'none registered'}`,
      );
    }

    return handler;
  }

  /**
   * Check if a handler exists for a MIME type
   * @param mimeType - MIME type to check
   * @returns True if handler exists
   */
  has(mimeType: string): boolean {
    return this.handlers.has(mimeType);
  }

  /**
   * Get all supported MIME types
   * @returns Array of registered MIME types
   */
  getSupportedMimeTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get count of registered handlers
   * @returns Number of MIME types with registered handlers
   */
  count(): number {
    return this.handlers.size;
  }

  /**
   * Get registry information for debugging/monitoring
   * @returns Object containing registry statistics
   */
  getRegistryInfo(): {
    totalHandlers: number;
    supportedMimeTypes: string[];
  } {
    return {
      totalHandlers: this.handlers.size,
      supportedMimeTypes: this.getSupportedMimeTypes(),
    };
  }

  /**
   * Clear all registered handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
    this.logger.log('Cleared all document handlers');
  }
}
