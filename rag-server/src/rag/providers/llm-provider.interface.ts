export interface LlmProvider {
  generateAnswer(prompt: string): Promise<string>;
  streamAnswer(prompt: string): AsyncGenerator<string>;
}
