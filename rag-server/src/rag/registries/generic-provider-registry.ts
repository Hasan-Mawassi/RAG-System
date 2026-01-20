import { Logger } from '@nestjs/common';
import { ProviderRegistry } from './provider-registry.interface';

/**
 * Generic provider registry implementation
 * Manages registration and retrieval of providers at runtime
 *
 * @template T - The type of provider being registered
 */
export class GenericProviderRegistry<T> implements ProviderRegistry<T> {
  protected registry = new Map<string, T>();
  protected readonly logger: Logger;

  constructor(loggerContext: string = 'ProviderRegistry') {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Register a new provider
   */
  register(name: string, implementation: T): void {
    if (this.registry.has(name)) {
      this.logger.warn(
        `Overwriting existing provider registration: "${name}". This may be intentional during module initialization.`,
      );
    }

    this.registry.set(name, implementation);
    this.logger.debug(`✓ Registered provider: "${name}"`);
  }

  /**
   * Unregister a provider
   */
  unregister(name: string): void {
    if (!this.registry.has(name)) {
      this.logger.warn(
        `Attempted to unregister non-existent provider: "${name}"`,
      );
      return;
    }

    this.registry.delete(name);
    this.logger.debug(`✓ Unregistered provider: "${name}"`);
  }

  /**
   * Get a specific provider by name
   */
  get(name: string): T {
    const provider = this.registry.get(name);

    if (!provider) {
      const availableProviders = Array.from(this.registry.keys()).join(', ');
      const message = availableProviders
        ? `Provider "${name}" not found. Available providers: ${availableProviders}`
        : `Provider "${name}" not found. No providers registered.`;
      throw new Error(message);
    }

    return provider;
  }

  /**
   * Get all registered providers
   */
  getAll(): Map<string, T> {
    return new Map(this.registry);
  }

  /**
   * Check if a provider is registered
   */
  has(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Get count of registered providers
   */
  count(): number {
    return this.registry.size;
  }

  /**
   * Get names of all registered providers
   */
  getNames(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.registry.clear();
    this.logger.debug('✓ Cleared all provider registrations');
  }

  /**
   * List all providers in a formatted way
   */
  listProviders(): string {
    if (this.registry.size === 0) {
      return 'No providers registered';
    }

    const names = Array.from(this.registry.keys());
    return `Registered providers (${names.length}): ${names.join(', ')}`;
  }
}
