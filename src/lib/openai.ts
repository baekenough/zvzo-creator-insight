import OpenAI from 'openai';
import { z } from 'zod';
import { delay } from './utils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Error types
export class OpenAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelay: 1000,
  backoffMultiplier: 2,
};

// Check if error is retryable
function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    return [
      'rate_limit_exceeded',
      'timeout',
      'server_error',
      'connection_error',
    ].includes(error.type || '');
  }
  return false;
}

// Call OpenAI with retry logic
async function callWithRetry<T>(
  apiCall: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;

      // If not retryable or last attempt, throw immediately
      if (!isRetryableError(error) || attempt === config.maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delayMs = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
      console.warn(`[OpenAI] Retry attempt ${attempt + 1}/${config.maxRetries} after ${delayMs}ms`);
      await delay(delayMs);
    }
  }

  /* c8 ignore next 2 */
  throw lastError;
}

// Main API call function with JSON mode and validation
export async function callOpenAI<T extends z.ZodType>(
  systemPrompt: string,
  userPrompt: string,
  schema: T,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  } = {}
): Promise<z.infer<T>> {
  const {
    temperature = 0.3,
    maxTokens = 2000,
    model = 'gpt-4o',
  } = options;

  try {
    const response = await callWithRetry(
      () =>
        openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
        }),
      DEFAULT_RETRY_CONFIG
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new OpenAIError(
        'OpenAI response content is empty',
        'ANALYSIS_INVALID_RESPONSE',
        500
      );
    }

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      throw new OpenAIError(
        'Failed to parse OpenAI response as JSON',
        'ANALYSIS_INVALID_RESPONSE',
        500,
        parseError
      );
    }

    // Validate with Zod schema
    try {
      return schema.parse(parsed);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('[OpenAI] Validation error:', validationError.errors);
        throw new OpenAIError(
          'AI response validation failed',
          'ANALYSIS_INVALID_RESPONSE',
          500,
          validationError
        );
      }
      throw validationError;
    }
  } catch (error) {
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error('[OpenAI] API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type,
      });

      // Map OpenAI errors to our error codes
      if (error.type === 'rate_limit_exceeded') {
        throw new OpenAIError(
          'OpenAI rate limit exceeded',
          'OPENAI_RATE_LIMITED',
          429,
          error
        );
      }

      if (error.status === 401) {
        throw new OpenAIError(
          'Invalid OpenAI API key',
          'OPENAI_INVALID_KEY',
          500,
          error
        );
      }

      if (error.type === 'insufficient_quota') {
        throw new OpenAIError(
          'OpenAI quota exceeded',
          'OPENAI_QUOTA_EXCEEDED',
          500,
          error
        );
      }

      throw new OpenAIError(
        `OpenAI API error: ${error.message}`,
        'OPENAI_ERROR',
        error.status || 500,
        error
      );
    }

    // Re-throw our custom errors
    if (error instanceof OpenAIError) {
      throw error;
    }

    // Unknown error
    throw new OpenAIError(
      'Unknown error during OpenAI API call',
      'ANALYSIS_FAILED',
      500,
      error
    );
  }
}

// Export the OpenAI client for direct use if needed
export { openai };
