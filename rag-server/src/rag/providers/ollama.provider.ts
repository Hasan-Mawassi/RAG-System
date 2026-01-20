import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from '@langchain/ollama';
import { LlmProvider } from './llm-provider.interface';
import { RagConfigService } from '../../config/rag.config';

/**
 * Ollama LLM Provider
 *
 * Implements the LlmProvider interface for local Ollama models
 * Supports models like qwen2:1.5b, llama2, and others
 *
 * Configuration required:
 * - OLLAMA_BASE_URL: Base URL to Ollama service (default: http://localhost:11434)
 * - CHAT_MODEL: Model name (default: qwen2:1.5b)
 */
@Injectable()
export class OllamaProvider implements LlmProvider {
  private llm: Ollama;
  private readonly logger = new Logger(OllamaProvider.name);

  constructor(private configService: RagConfigService) {
    this.llm = new Ollama({
      model: this.configService.chatModel,
      baseUrl: this.configService.ollamaBaseUrl,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    });
    this.logger.log(
      `✓ Initialized Ollama provider with model: ${this.configService.chatModel}`,
    );
  }

  /**
   * Generate answer using Ollama model
   * @param prompt - The prompt to send to the model
   * @returns Generated answer text
   */
  async generateAnswer(prompt: string): Promise<string> {
    try {
      const result = (await this.llm.invoke(prompt)) as any;

      // 1) If direct string
      if (typeof result === 'string') return result.trim();

      // 2) If LangChain message with .content
      if (result && typeof result.content === 'string') {
        return result.content.trim();
      }

      // 3) If content array (some models return array chunks)
      if (Array.isArray(result?.content)) {
        return result.content
          .map((c: any) => (typeof c === 'string' ? c : (c.text ?? '')))
          .join('')
          .trim();
      }

      // 4) Fallback: try convert to string
      return String(result ?? '').trim();
    } catch (error) {
      this.logger.error('Error in Ollama generateAnswer:', error);
      throw error;
    }
  }

  /**
   * Stream answer from Ollama model
   * @param prompt - The prompt to send to the model
   * @yields Answer text chunks as they are generated
   */
  async *streamAnswer(prompt: string): AsyncGenerator<string> {
    try {
      const stream = await this.llm.stream(prompt);

      for await (const chunk of stream as any) {
        let text: string = '';

        // 1) raw string
        if (typeof chunk === 'string') {
          text = chunk;
        }

        // 2) Ollama-style { text: "..." }
        if (!text && typeof chunk?.text === 'string') {
          text = chunk.text;
        }

        // 3) LangChain message { content: "..."}
        if (!text && typeof chunk?.content === 'string') {
          text = chunk.content;
        }

        // 4) Array content
        if (!text && Array.isArray(chunk?.content)) {
          text = chunk.content
            .map((part: any) =>
              typeof part === 'string' ? part : (part.text ?? ''),
            )
            .join('');
        }

        if (text.trim().length > 0) {
          yield text;
        }
      }
    } catch (error) {
      this.logger.error('Error in Ollama streamAnswer:', error);
      throw error;
    }
  }
}
