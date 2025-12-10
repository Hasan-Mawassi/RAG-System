import * as Joi from 'joi';
import { AppConfig } from './app.config';
import { AuthConfig } from './auth.config';

export interface ConfigTypes {
  app: AppConfig;
  auth: AuthConfig;
}
export const appConfigSchema = Joi.object({
  PORT: Joi.number().port().default(3000),
  //   Auth validation
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),
  // RAG validation
  LLM_PROVIDER: Joi.string().valid('ollama', 'groq').default('ollama'),
  OLLAMA_BASE_URL: Joi.string().uri().required(),
  EMBEDDING_MODEL: Joi.string().required(),
  CHAT_MODEL: Joi.string().required(),
  CHROMA_URL: Joi.string().uri().required(),
  COLLECTION_NAME: Joi.string().required(),
  MAX_FILE_SIZE: Joi.number().required(),
  CHUNK_SIZE: Joi.number().required(),
  CHUNK_OVERLAP: Joi.number().required(),

  // Groq
  GROQ_API_KEY: Joi.string().allow('').required(),
  GROQ_MODEL: Joi.string().required(),
});
