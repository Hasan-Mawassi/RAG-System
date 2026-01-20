import { Injectable, Logger } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import type { ChatGroqInput } from '@langchain/groq';
import { LlmProvider } from './llm-provider.interface';
import { RagConfigService } from '../../config/rag.config';

/**
 * Groq LLM Provider
 *
 * Implements the LlmProvider interface for Groq's cloud-based models
 * Provides high-speed inference via Groq's API
 *
 * Configuration required:
 * - GROQ_API_KEY: API key for Groq service
 * - GROQ_MODEL: Model name (e.g., llama-3.1-8b-instant)
 */
@Injectable()
export class GroqProvider implements LlmProvider {
  private model: ChatGroq;
  private readonly logger = new Logger(GroqProvider.name);

  constructor(private configService: RagConfigService) {
    const options: ChatGroqInput = {
      apiKey: this.configService.groqApiKey,
      model: this.configService.groqModel,
      temperature: 0.7,
    };

    this.model = new ChatGroq(options);
    this.logger.log(
      `✓ Initialized Groq provider with model: ${this.configService.groqModel}`,
    );
  }

  /**
   * Generate answer using Groq model
   * @param prompt - The prompt to send to the model
   * @returns Generated answer text
   */
  async generateAnswer(prompt: string): Promise<string> {
    try {
      // LangChain chat models accept a string and return an AIMessage
      const res = await this.model.invoke(prompt);

      if (typeof res.content === 'string') {
        return res.content.trim();
      }

      if (Array.isArray(res.content)) {
        const text = res.content
          .map((part: any) =>
            typeof part === 'string' ? part : (part.text ?? ''),
          )
          .join('');
        return text.trim();
      }

      return String(res.content ?? '').trim();
    } catch (error) {
      this.logger.error('Error in Groq generateAnswer:', error);
      throw error;
    }
  }

  /**
   * Stream answer from Groq model
   * @param prompt - The prompt to send to the model
   * @yields Answer text chunks as they are generated
   */
  async *streamAnswer(prompt: string): AsyncGenerator<string> {
    try {
      const stream = await this.model.stream(prompt);

      for await (const chunk of stream) {
        if (!chunk) continue;

        let text = '';
        if (typeof chunk.content === 'string') {
          text = chunk.content;
        } else if (Array.isArray(chunk.content)) {
          text = chunk.content
            .map((part: any) =>
              typeof part === 'string' ? part : (part.text ?? ''),
            )
            .join('');
        }

        if (text) {
          yield text;
        }
      }
    } catch (error) {
      this.logger.error('Error in Groq streamAnswer:', error);
      throw error;
    }
  }
}
