/**
 * Generic interface for provider registry implementations
 * This allows any type of provider to be registered and retrieved
 *
 * @template T - The type of provider being registered
 */
export interface ProviderRegistry<T> {
  /**
   * Register a new provider implementation
   * @param name - Unique identifier for the provider
   * @param implementation - The provider instance
   */
  register(name: string, implementation: T): void;

  /**
   * Unregister a provider by name
   * @param name - The provider identifier
   */
  unregister(name: string): void;

  /**
   * Get a specific provider by name
   * @param name - The provider identifier
   * @returns The provider instance
   * @throws Error if provider not found
   */
  get(name: string): T;

  /**
   * Get all registered providers
   * @returns Map of all registered providers
   */
  getAll(): Map<string, T>;

  /**
   * Check if a provider is registered
   * @param name - The provider identifier
   * @returns true if provider exists, false otherwise
   */
  has(name: string): boolean;

  /**
   * Get count of registered providers
   * @returns Number of registered providers
   */
  count(): number;

  /**
   * Get names of all registered providers
   * @returns Array of provider names
   */
  getNames(): string[];
}
