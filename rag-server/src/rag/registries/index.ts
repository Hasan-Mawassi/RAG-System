/**
 * Registries - Provider registry implementations
 *
 * This module provides registry patterns for managing dynamic provider registration
 * and retrieval at runtime, enabling plugin-like architecture and easier testing.
 */

export * from './provider-registry.interface';
export * from './generic-provider-registry';
export * from './llm-provider-registry';
export * from './registries.module';
