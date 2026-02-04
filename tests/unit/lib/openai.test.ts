import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Mock delay to be instant
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual,
    delay: vi.fn().mockResolvedValue(undefined),
  };
});

// Create mock function outside
const mockCreate = vi.fn();

// Mock OpenAI
vi.mock('openai', () => {
  class MockAPIError extends Error {
    status: number;
    code: string | null;
    type: string;
    constructor(status: number, body: any, message: string, headers: any) {
      super(message);
      this.status = status;
      this.code = body?.code || null;
      this.type = body?.type || 'api_error';
      this.name = 'APIError';
    }
  }

  return {
    default: class OpenAI {
      static APIError = MockAPIError;
      chat = {
        completions: {
          create: (...args: any[]) => mockCreate(...args),
        },
      };
    },
  };
});

// Import after mocks are set up
import { OpenAIError, callOpenAI } from '@/lib/openai';
import OpenAI from 'openai';

describe('lib/openai.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OpenAIError class', () => {
    it('should create an instance with all properties', () => {
      const originalError = new Error('Original error');
      const error = new OpenAIError(
        'Test error message',
        'TEST_CODE',
        500,
        originalError
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(OpenAIError);
      expect(error.name).toBe('OpenAIError');
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBe(500);
      expect(error.originalError).toBe(originalError);
    });

    it('should create an instance without optional parameters', () => {
      const error = new OpenAIError('Test error', 'TEST_CODE');

      expect(error.name).toBe('OpenAIError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBeUndefined();
      expect(error.originalError).toBeUndefined();
    });
  });

  describe('callOpenAI', () => {
    const testSchema = z.object({
      result: z.string(),
      value: z.number(),
    });

    it('should successfully call OpenAI and return validated data', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'success', value: 42 }),
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      const result = await callOpenAI(
        'System prompt',
        'User prompt',
        testSchema
      );

      expect(result).toEqual({ result: 'success', value: 42 });
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'System prompt' },
          { role: 'user', content: 'User prompt' },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });
    });

    it('should use custom options when provided', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'test', value: 1 }),
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await callOpenAI('System', 'User', testSchema, {
        temperature: 0.7,
        maxTokens: 1000,
        model: 'gpt-3.5-turbo',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'System' },
          { role: 'user', content: 'User' },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });
    });

    it('should throw ANALYSIS_INVALID_RESPONSE when content is empty', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('ANALYSIS_INVALID_RESPONSE');
          expect(error.message).toBe('OpenAI response content is empty');
          expect(error.status).toBe(500);
        }
      }
    });

    it('should throw ANALYSIS_INVALID_RESPONSE when content is not valid JSON', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is not JSON',
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('ANALYSIS_INVALID_RESPONSE');
          expect(error.message).toBe('Failed to parse OpenAI response as JSON');
          expect(error.status).toBe(500);
          expect(error.originalError).toBeDefined();
        }
      }
    });

    it('should throw ANALYSIS_INVALID_RESPONSE when Zod validation fails', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'test', value: 'not a number' }),
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('ANALYSIS_INVALID_RESPONSE');
          expect(error.message).toBe('AI response validation failed');
          expect(error.status).toBe(500);
          expect(error.originalError).toBeDefined();
        }
      }
    });

    it('should throw OPENAI_RATE_LIMITED when rate limit is exceeded', async () => {
      const rateLimitError = new OpenAI.APIError(
        429,
        { type: 'rate_limit_exceeded' },
        'Rate limit exceeded',
        {}
      );

      mockCreate.mockRejectedValue(rateLimitError);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('OPENAI_RATE_LIMITED');
          expect(error.message).toBe('OpenAI rate limit exceeded');
          expect(error.status).toBe(429);
          expect(error.originalError).toBe(rateLimitError);
        }
      }
    });

    it('should throw OPENAI_INVALID_KEY when API key is invalid (401)', async () => {
      const authError = new OpenAI.APIError(
        401,
        { type: 'invalid_request_error' },
        'Invalid API key',
        {}
      );

      mockCreate.mockRejectedValue(authError);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('OPENAI_INVALID_KEY');
          expect(error.message).toBe('Invalid OpenAI API key');
          expect(error.status).toBe(500);
          expect(error.originalError).toBe(authError);
        }
      }
    });

    it('should throw OPENAI_QUOTA_EXCEEDED when quota is exceeded', async () => {
      const quotaError = new OpenAI.APIError(
        429,
        { type: 'insufficient_quota' },
        'Insufficient quota',
        {}
      );

      mockCreate.mockRejectedValue(quotaError);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('OPENAI_QUOTA_EXCEEDED');
          expect(error.message).toBe('OpenAI quota exceeded');
          expect(error.status).toBe(500);
          expect(error.originalError).toBe(quotaError);
        }
      }
    });

    it('should throw OPENAI_ERROR for generic API errors', async () => {
      const genericError = new OpenAI.APIError(
        500,
        { type: 'server_error' },
        'Internal server error',
        {}
      );

      mockCreate.mockRejectedValue(genericError);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('OPENAI_ERROR');
          expect(error.message).toContain('OpenAI API error');
          expect(error.status).toBe(500);
          expect(error.originalError).toBe(genericError);
        }
      }
    });

    it('should throw ANALYSIS_FAILED for unknown errors', async () => {
      const unknownError = new Error('Some unknown error');

      mockCreate.mockRejectedValue(unknownError);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('ANALYSIS_FAILED');
          expect(error.message).toBe('Unknown error during OpenAI API call');
          expect(error.status).toBe(500);
          expect(error.originalError).toBe(unknownError);
        }
      }
    });

    it('should re-throw OpenAIError when it is thrown from inner try block', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('ANALYSIS_INVALID_RESPONSE');
        }
      }
    });

    it('should wrap non-ZodError from schema validation in OpenAIError', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ valid: true }),
            },
          },
        ],
      };

      mockCreate.mockResolvedValue(mockResponse);

      // Create a schema that throws a non-ZodError
      const customError = new Error('Custom parse error');
      const badSchema = {
        parse: () => {
          throw customError;
        },
      };

      await expect(
        callOpenAI('System', 'User', badSchema as any)
      ).rejects.toThrow(OpenAIError);

      try {
        await callOpenAI('System', 'User', badSchema as any);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          // The non-ZodError gets re-thrown at line 145, then caught by outer catch
          // and wrapped in OpenAIError at lines 199-204
          expect(error.code).toBe('ANALYSIS_FAILED');
          expect(error.message).toBe('Unknown error during OpenAI API call');
          expect(error.originalError).toBe(customError);
        }
      }
    });
  });

  describe('callOpenAI retry logic', () => {
    const testSchema = z.object({
      result: z.string(),
    });

    it('should retry on retryable errors and eventually succeed', async () => {
      const rateLimitError = new OpenAI.APIError(
        429,
        { type: 'rate_limit_exceeded' },
        'Rate limit exceeded',
        {}
      );

      const successResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'success' }),
            },
          },
        ],
      };

      // Fail on first attempt, succeed on second
      mockCreate
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(successResponse);

      const result = await callOpenAI('System', 'User', testSchema);

      expect(result).toEqual({ result: 'success' });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should retry multiple times with timeout errors', async () => {
      const timeoutError = new OpenAI.APIError(
        408,
        { type: 'timeout' },
        'Request timeout',
        {}
      );

      const successResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'success' }),
            },
          },
        ],
      };

      // Fail twice, then succeed
      mockCreate
        .mockRejectedValueOnce(timeoutError)
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce(successResponse);

      const result = await callOpenAI('System', 'User', testSchema);

      expect(result).toEqual({ result: 'success' });
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it('should retry on server_error', async () => {
      const serverError = new OpenAI.APIError(
        500,
        { type: 'server_error' },
        'Server error',
        {}
      );

      const successResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'success' }),
            },
          },
        ],
      };

      mockCreate
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce(successResponse);

      const result = await callOpenAI('System', 'User', testSchema);

      expect(result).toEqual({ result: 'success' });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should retry on connection_error', async () => {
      const connectionError = new OpenAI.APIError(
        0,
        { type: 'connection_error' },
        'Connection error',
        {}
      );

      const successResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ result: 'success' }),
            },
          },
        ],
      };

      mockCreate
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValueOnce(successResponse);

      const result = await callOpenAI('System', 'User', testSchema);

      expect(result).toEqual({ result: 'success' });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should exhaust retries and throw on persistent retryable errors', async () => {
      const rateLimitError = new OpenAI.APIError(
        429,
        { type: 'rate_limit_exceeded' },
        'Rate limit exceeded',
        {}
      );

      // Fail on all attempts (initial + 2 retries = 3 total)
      mockCreate.mockRejectedValue(rateLimitError);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      // Should be called 3 times (initial + 2 retries)
      expect(mockCreate).toHaveBeenCalledTimes(3);

      // Verify we're throwing the rate limit error after exhaustion
      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('OPENAI_RATE_LIMITED');
        }
      }
    });

    it('should not retry on non-retryable errors', async () => {
      const authError = new OpenAI.APIError(
        401,
        { type: 'invalid_request_error' },
        'Invalid API key',
        {}
      );

      mockCreate.mockRejectedValue(authError);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      // Should only be called once (no retries for non-retryable errors)
      expect(mockCreate).toHaveBeenCalledTimes(1);

      try {
        await callOpenAI('System', 'User', testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIError);
        if (error instanceof OpenAIError) {
          expect(error.code).toBe('OPENAI_INVALID_KEY');
        }
      }
    });

    it('should not retry on insufficient quota errors', async () => {
      const quotaError = new OpenAI.APIError(
        429,
        { type: 'insufficient_quota' },
        'Quota exceeded',
        {}
      );

      mockCreate.mockRejectedValue(quotaError);

      await expect(
        callOpenAI('System', 'User', testSchema)
      ).rejects.toThrow(OpenAIError);

      // Should only be called once (insufficient_quota is not in retryable list)
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });
});
