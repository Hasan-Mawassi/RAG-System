import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class QueryDto {
  /**
   * The user's question to ask the RAG / AI model
   * @example "What are the key points from page 5 of my uploaded PDF?"
   */
  @IsString()
  question: string;

  /**
   * The model name to be used for answering the question
   * @example "qwen2:1.5b"
   */
  @IsString()
  modelName: string;

  /**
   * The provider of the AI model (local or cloud)
   * @example "ollama"
   */
  @IsString()
  modelProvider: string;

  /**
   * Optional chat session ID.
   * If provided, the response will be appended to an existing chat.
   * @example "chat_018bfca3ac0"
   */
  @IsOptional()
  @IsString()
  chatId: string | null;

  /**
   * Number of top relevant documents to retrieve.
   * Controls how many chunks RAG fetches from vector DB.
   * Must be between 1 and 10.
   * @example 5
   */
  @IsInt()
  @Min(1)
  @Max(10)
  topK: number;
}
