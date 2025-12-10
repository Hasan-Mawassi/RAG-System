import { Ollama } from '@langchain/ollama';
import { LlmProvider } from './llm-provider.interface';

export class OllamaProvider implements LlmProvider {
  private llm: Ollama;

  constructor(config: { model: string; baseUrl: string }) {
    this.llm = new Ollama({
      model: config.model,
      baseUrl: config.baseUrl,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    });
  }

  async generateAnswer(prompt: string): Promise<string> {
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
  }
  async *streamAnswer(prompt: string): AsyncGenerator<string> {
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
  }
}
