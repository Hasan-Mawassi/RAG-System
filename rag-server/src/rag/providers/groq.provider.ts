import { ChatGroq } from '@langchain/groq';
import type { ChatGroqInput } from '@langchain/groq';
import { LlmProvider } from './llm-provider.interface';

export class GroqProvider implements LlmProvider {
  private model: ChatGroq;

  constructor(config: { apiKey: string; model: string; temperature?: number }) {
    const options: ChatGroqInput = {
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature ?? 0.7,
    };

    this.model = new ChatGroq(options);
  }

  async generateAnswer(prompt: string): Promise<string> {
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
  }

  async *streamAnswer(prompt: string): AsyncGenerator<string> {
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
  }
}
