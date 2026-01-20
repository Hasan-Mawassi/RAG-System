// ============================================
// STEP 7: LLM Service (src/services/llm.service.ts)
// ============================================
// Manages interaction with Ollama's qwen2:1.5b chat model
// Implements RAG by combining retrieved context with user queries

// import { Injectable, Logger } from '@nestjs/common';
// import { Ollama } from '@langchain/ollama';
// import { PromptTemplate } from '@langchain/core/prompts';
// import { RunnableSequence } from '@langchain/core/runnables';
// import { StringOutputParser } from '@langchain/core/output_parsers';
// import { Document } from '@langchain/core/documents';
// import { RagConfigService } from '../../config/rag.config';
// import type { OllamaInput } from '@langchain/ollama';

// @Injectable()
// export class LlmService {
//   private readonly logger = new Logger(LlmService.name);
//   private llm: any;
//   private ragChain: RunnableSequence;

//   constructor(private configService: RagConfigService) {
//     // this.initializeLlm();
//     // this.setupRagChain();

//   }
//   /** -----------------------------------------------------
//    *  FACTORY: returns correct LLM based on provider
//    * ----------------------------------------------------- */
//   private getChatModel() {
//     const provider = this.config.provider;

//     if (provider === 'ollama') {
//       return new Ollama({
//         model: this.config.chatModel,
//         baseUrl: this.config.ollamaBaseUrl,
//         temperature: 0.7,
//         topP: 0.9,
//         topK: 40,
//       });
//     }

//     if (provider === 'groq') {
//       return new ChatGroq({
//         apiKey: this.config.groqApiKey,
//         model: this.config.groqModel,
//         temperature: 0.7,
//       });
//     }

//     throw new Error(`Unknown LLM provider: ${provider}`);
//   }

//   /** Create the full RAG execution chain dynamically */
//   private buildRagChain(model: any) {
//     const prompt = PromptTemplate.fromTemplate(`
// You are a helpful assistant.
// Use ONLY the provided context to answer the question.

// Context:
// {context}

// Question: {question}

// Answer:
// `);

//     return RunnableSequence.from([prompt, model, new StringOutputParser()]);
//   }
//   /**
//    * Initialize Ollama LLM with qwen2:1.5b model
//    * This is a lightweight yet capable model for question-answering
//    */

//   private initializeLlm() {
//     const config: OllamaInput = {
//       model: this.configService.chatModel,
//       baseUrl: this.configService.ollamaBaseUrl,
//       temperature: 0.7,
//       topP: 0.9,
//       topK: 40,
//     };

//     try {
//       this.llm = new Ollama(config);
//       this.logger.log(
//         `LLM initialized with model: ${this.configService.chatModel}`,
//       );
//     } catch (error) {
//       this.logger.error('Failed to initialize Ollama:', error);
//       throw new Error('Ollama initialization failed');
//     }
//   }

//   /**
//    * Setup the RAG chain using LangChain's LCEL (LangChain Expression Language)
//    * This chain: formats prompt -> calls LLM -> parses output
//    */
//   private setupRagChain() {
//     // Define the RAG prompt template
//     const ragPromptTemplate = PromptTemplate.fromTemplate(
//       `You are a helpful assistant that answers questions based on the provided context.
// Use the following pieces of context to answer the question at the end.
// If you don't know the answer based on the context, just say that you don't know, don't try to make up an answer.
// Keep your answer concise and relevant to the question.

// Context:
// {context}

// Question: {question}

// Answer:`,
//     );

//     // // Create the RAG chain: prompt -> LLM -> output parser
//     this.ragChain = RunnableSequence.from([
//       ragPromptTemplate,
//       this.llm,
//       new StringOutputParser(),
//     ]);
//     this.logger.log('RAG chain initialized successfully');
//   }

//   /**
//    * Generate answer using RAG approach
//    * @param question - User's question
//    * @param relevantDocs - Retrieved documents from vector store
//    * @returns AI-generated answer based on context
//    */
//   async generateAnswer(
//     question: string,
//     relevantDocs: Document[],
//   ): Promise<string> {
//     try {
//       // Combine retrieved documents into context
//       const context = this.formatContext(relevantDocs);

//       this.logger.log(`Generating answer for question: "${question}"`);
//       this.logger.debug(`Using ${relevantDocs.length} documents as context`);

//       // Invoke the RAG chain

//       const answer = await this.ragChain.invoke({
//         context,
//         question,
//       });

//       this.logger.log('Answer generated successfully');
//       return answer.trim();
//     } catch (error) {
//       this.logger.error('Error generating answer:', error);
//       throw new Error(`Failed to generate answer: ${error.message}`);
//     }
//   }

//   /**
//    * Format retrieved documents into a readable context string
//    * @param docs - Array of relevant documents
//    * @returns Formatted context string
//    */
//   private formatContext(docs: Document[]): string {
//     return docs
//       .map((doc, index) => {
//         const source = doc.metadata.filename || 'Unknown';
//         const chunk = doc.metadata.chunkIndex ?? index;
//         return `[Document: ${source}, Chunk ${chunk}]\n${doc.pageContent}`;
//       })
//       .join('\n\n---\n\n');
//   }

//   /**
//    * Generate a simple response without RAG context
//    * Useful for general queries not requiring document context
//    * @param prompt - User's prompt/question
//    */
//   async generateSimpleResponse(prompt: string): Promise<string> {
//     try {
//       const response = await this.llm.invoke(prompt);
//       return response.trim();
//     } catch (error) {
//       this.logger.error('Error generating simple response:', error);
//       throw new Error(`Failed to generate response: ${error.message}`);
//     }
//   }

//   /**
//    * Stream responses for real-time output (useful for long answers)
//    * @param question - User's question
//    * @param relevantDocs - Retrieved documents
//    */
//   async *streamAnswer(
//     question: string,
//     relevantDocs: Document[],
//   ): AsyncGenerator<string> {
//     try {
//       const context = this.formatContext(relevantDocs);
//       const stream = await this.ragChain.stream({ context, question });

//       let lastOutput = '';

//       for await (const chunk of stream) {
//         const text = this.extractTextFromChunk(chunk);
//         if (!text || !text.trim()) continue;

//         // Prevent repeated trailing sequence
//         const clean = this.removeDuplicatePrefix(text, lastOutput);

//         lastOutput += clean;
//         yield clean;
//       }
//     } catch (error) {
//       this.logger.error('Error streaming answer:', error);
//       throw new Error(`Failed to stream answer: ${error.message}`);
//     }
//   }

//   private removeDuplicatePrefix(newText: string, accumulated: string): string {
//     if (!accumulated) return newText;

//     const maxCheck = 50; // check last 50 characters
//     const tail = accumulated.slice(-maxCheck);

//     if (newText.startsWith(tail)) {
//       return newText.slice(tail.length);
//     }
//     return newText;
//   }
//   private extractTextFromChunk(chunk: any): string {
//     if (!chunk) return '';

//     // 1) Simple string chunk
//     if (typeof chunk === 'string') return chunk;

//     // 2) LangChain LLMResult content chunk
//     if (chunk.content && typeof chunk.content === 'string') {
//       return chunk.content;
//     }

//     // 3) Ollama / ChatModel chunk format:
//     // { type: "output", content: "..." }
//     if (chunk.type === 'output' && typeof chunk.content === 'string') {
//       return chunk.content;
//     }

//     // 4) LangChain streaming standard format:
//     // { data: { content: "..." }}
//     if (chunk.data?.content && typeof chunk.data.content === 'string') {
//       return chunk.data.content;
//     }

//     // 5) "delta" (OpenAI style) — normally NOT used by Ollama
//     if (chunk.delta?.content && typeof chunk.delta.content === 'string') {
//       return chunk.delta.content;
//     }

//     // 6) If chunk.text exists
//     if (chunk.text && typeof chunk.text === 'string') {
//       return chunk.text;
//     }

//     return '';
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { RagConfigService } from '../../config/rag.config';
import { LlmProviderRegistry } from '../registries/llm-provider-registry';

/**
 * LLM Service
 *
 * Orchestrates interactions with LLM providers through the registry pattern
 * Handles:
 * - Answer generation with RAG context
 * - Streaming responses
 * - Prompt building and context formatting
 *
 * This service is provider-agnostic - it works with any LLM provider registered
 * in the LlmProviderRegistry
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly configService: RagConfigService,
    private readonly llmRegistry: LlmProviderRegistry,
  ) {}

  /**
   * Get an LLM provider from the registry
   *
   * @param modelProvider - Provider name (e.g., 'ollama', 'groq')
   * @param modelName - Model identifier (used as fallback, provider may use default)
   * @returns The LLM provider instance
   * @throws Error if provider not registered
   */
  private getProvider(modelProvider: string, modelName: string) {
    this.logger.debug(
      `Retrieving provider: "${modelProvider}" with model: "${modelName}"`,
    );

    try {
      return this.llmRegistry.getProvider(modelProvider);
    } catch (error) {
      const available = this.llmRegistry.getNames();
      this.logger.error(
        `Failed to get provider "${modelProvider}". Available: ${available.join(', ')}`,
      );
      throw error;
    }
  }

  /**
   * Build RAG prompt template
   * Combines context and question into a structured prompt
   */
  private buildRagPrompt(context: string, question: string): string {
    return `
You are a helpful assistant that answers questions based on the provided context.
Use ONLY the provided context.
If the answer is not in the context, say "I don't know".

Context:
${context}

Question: ${question}

Answer:
`.trim();
  }

  /**
   * Format retrieved documents into readable context
   */
  private formatContext(docs: Document[]): string {
    return docs
      .map((doc, index) => {
        const source = doc.metadata.filename || 'Unknown';
        const chunk = doc.metadata.chunkIndex ?? index;
        return `[Document: ${source}, Chunk ${chunk}]\n${doc.pageContent}`;
      })
      .join('\n\n---\n\n');
  }

  /**
   * Remove duplicate prefix from new text
   * Prevents repeated output during streaming
   */
  private removeDuplicatePrefix(newText: string, accumulated: string): string {
    if (!accumulated) return newText;
    const tail = accumulated.slice(-50);
    if (newText.startsWith(tail)) {
      return newText.slice(tail.length);
    }
    return newText;
  }

  /**
   * Generate answer using RAG with a specific LLM provider
   *
   * @param question - User's question
   * @param relevantDocs - Retrieved document chunks from vector store
   * @param modelProvider - LLM provider name (e.g., 'ollama', 'groq')
   * @param modelName - Model identifier for provider
   * @returns Generated answer based on context
   */
  async generateAnswer(
    question: string,
    relevantDocs: Document[],
    modelProvider: string,
    modelName: string,
  ): Promise<string> {
    try {
      const provider = this.getProvider(modelProvider, modelName);

      const context = this.formatContext(relevantDocs);
      const prompt = this.buildRagPrompt(context, question);

      this.logger.log(
        `Generating answer [provider=${modelProvider}, model=${modelName}, docs=${relevantDocs.length}]`,
      );

      const answer = await provider.generateAnswer(prompt);
      return answer.trim();
    } catch (error: any) {
      this.logger.error(
        `Error generating answer with ${modelProvider}:`,
        error,
      );
      throw new Error(`Failed to generate answer: ${error?.message}`);
    }
  }

  /**
   * Generate a simple response without RAG context
   *
   * @param prompt - Direct prompt/question
   * @param modelProvider - LLM provider name
   * @param modelName - Model identifier
   * @returns Generated response
   */
  async generateSimpleResponse(
    prompt: string,
    modelProvider: string,
    modelName: string,
  ): Promise<string> {
    try {
      const provider = this.getProvider(modelProvider, modelName);
      const response = await provider.generateAnswer(prompt);
      return response.trim();
    } catch (error: any) {
      this.logger.error(
        `Error in simple response with ${modelProvider}:`,
        error,
      );
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /** Streaming */
  async *streamAnswer(
    question: string,
    relevantDocs: Document[],
    modelProvider: string,
    modelName: string,
  ): AsyncGenerator<string> {
    try {
      const provider = this.getProvider(modelProvider, modelName);

      const context = this.formatContext(relevantDocs);
      const prompt = this.buildRagPrompt(context, question);

      this.logger.log(
        `Streaming answer [provider=${modelProvider}, model=${modelName}]`,
      );

      const stream = provider.streamAnswer(prompt);
      let lastOutput = '';

      for await (const chunk of stream) {
        if (!chunk || !chunk.trim()) continue;

        const clean = this.removeDuplicatePrefix(chunk, lastOutput);
        lastOutput += clean;
        if (clean) {
          yield clean;
        }
      }
    } catch (error: any) {
      this.logger.error(`Error streaming with ${modelProvider}:`, error);
      throw new Error(`Failed to stream answer: ${error.message}`);
    }
  }
}
