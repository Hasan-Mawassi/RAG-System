import { ModelProvider } from '../llm/model-providers';
import { LlmProvider } from './llm-provider.interface';
import { OllamaProvider } from './ollama.provider';
import { GroqProvider } from './groq.provider';

export class LlmFactory {
  static create(provider: ModelProvider, config: any): LlmProvider {
    switch (provider) {
      case 'ollama':
        return new OllamaProvider({
          model: config.modelName, // e.g. qwen2:1.5b
          baseUrl: config.baseUrl, // OLLAMA_BASE_URL
        });

      case 'groq':
        return new GroqProvider({
          apiKey: config.apiKey, // GROQ_API_KEY
          model: config.groqModel, // GROQ_MODEL or CHAT_MODEL
          temperature: config.temperature ?? 0.7,
        });

      default:
        throw new Error('Unknown LLM provider: ' + String(provider));
    }
  }
}
