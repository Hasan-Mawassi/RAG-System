import { Injectable } from '@nestjs/common';
import { GenericProviderRegistry } from './generic-provider-registry';
import { LlmProvider } from '../providers/llm-provider.interface';

/**
 * Specialized registry for LLM providers
 * Manages registration of different LLM implementations (Ollama, Groq, Claude, etc.)
 *
 * Responsibilities:
 * - Register/unregister LLM providers
 * - Retrieve providers by name
 * - Validate provider availability
 * - Provide default provider selection
 */
@Injectable()
export class LlmProviderRegistry extends GenericProviderRegistry<LlmProvider> {
  private defaultProvider: string | null = null;

  constructor() {
    super('LlmProviderRegistry');
  }

  /**
   * Register an LLM provider
   * @param name - Unique provider identifier (e.g., 'ollama', 'groq', 'claude')
   * @param provider - The LLM provider instance
   */
  register(name: string, provider: LlmProvider): void {
    super.register(name, provider);

    // Set first registered provider as default
    if (!this.defaultProvider) {
      this.defaultProvider = name;
      this.logger.log(`Set default LLM provider: "${name}"`);
    }
  }

  /**
   * Get an LLM provider by name, or return default
   * @param name - Provider identifier. If not provided, returns default provider
   * @returns The LLM provider instance
   * @throws Error if provider not found and no default exists
   */
  getProvider(name?: string): LlmProvider {
    const providerName = name || this.defaultProvider;

    if (!providerName) {
      throw new Error(
        'No LLM provider specified and no default provider set. ' +
          'Available providers: ' +
          (this.getNames().length > 0 ? this.getNames().join(', ') : 'none'),
      );
    }

    return this.get(providerName);
  }

  /**
   * Get the default LLM provider
   * @returns The default provider or null if none set
   */
  getDefault(): LlmProvider | null {
    if (!this.defaultProvider) {
      return null;
    }
    return this.registry.get(this.defaultProvider) || null;
  }

  /**
   * Set a different default provider
   * @param name - Provider name to set as default
   * @throws Error if provider doesn't exist
   */
  setDefault(name: string): void {
    if (!this.has(name)) {
      throw new Error(
        `Cannot set default provider: "${name}" not registered. ` +
          `Available: ${this.getNames().join(', ')}`,
      );
    }

    this.defaultProvider = name;
    this.logger.log(`✓ Changed default LLM provider to: "${name}"`);
  }

  /**
   * Get the name of the default provider
   * @returns Default provider name or null
   */
  getDefaultName(): string | null {
    return this.defaultProvider;
  }

  /**
   * Validate that a provider is registered
   * Useful for early error detection in configuration
   * @param name - Provider name to validate
   * @throws Error if provider not registered
   */
  validateProvider(name: string): void {
    if (!this.has(name)) {
      const available = this.getNames();
      throw new Error(
        `LLM provider "${name}" not found. ` +
          `Available providers: ${available.length > 0 ? available.join(', ') : 'none'}. ` +
          `Ensure provider is registered in RagModule.`,
      );
    }
  }

  /**
   * Get provider details for logging/debugging
   * @returns Human-readable provider information
   */
  getRegistryInfo(): {
    default: string | null;
    registered: string[];
    count: number;
  } {
    return {
      default: this.defaultProvider,
      registered: this.getNames(),
      count: this.count(),
    };
  }

  /**
   * Unregister a provider
   * If it was the default, sets default to first available provider
   */
  unregister(name: string): void {
    if (this.defaultProvider === name) {
      const remaining = this.getNames().filter((n) => n !== name);
      this.defaultProvider = remaining.length > 0 ? remaining[0] : null;
      if (this.defaultProvider) {
        this.logger.log(
          `Default provider "${name}" was unregistered. ` +
            `New default: "${this.defaultProvider}"`,
        );
      }
    }

    super.unregister(name);
  }
}
