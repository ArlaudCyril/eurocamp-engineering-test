import axios, { type AxiosRequestConfig, type Method } from 'axios';
import {
  BadGatewayError,
  EurocampClientError,
  HttpStatusError,
  NotFoundError,
  TimeoutError,
} from './errors';
import type { ClientOptions } from './types';

const DEFAULT_BASE_URL = 'http://localhost:3001/api/1';
const DEFAULT_TIMEOUT_MS = 1500;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 200;

type HttpTransport = {
  request<T>(config: AxiosRequestConfig): Promise<{ data: T }>;
};

type RequestOptions = {
  method: Method;
  url: string;
  data?: unknown;
};

export class HttpClient {
  private readonly transport: HttpTransport;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly retryDelayMs: number;

  constructor(options: ClientOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = options.retries ?? DEFAULT_RETRIES;
    this.retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
    this.transport =
      options.transport ??
      axios.create({
        baseURL: options.baseUrl ?? DEFAULT_BASE_URL,
        timeout: this.timeoutMs,
      });
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'GET', url });
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url });
  }

  private async request<T>(options: RequestOptions): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        const response = await this.transport.request<T>({
          method: options.method,
          url: options.url,
          data: options.data,
          timeout: this.timeoutMs,
        });

        return response.data;
      } catch (error) {
        const mappedError = this.mapError(error);

        // Only transient upstream failures should be retried.
        if (this.shouldRetry(mappedError, attempt)) {
          await sleep(this.retryDelayMs * 2 ** attempt);
          attempt += 1;
          continue;
        }

        throw mappedError;
      }
    }
  }

  private shouldRetry(error: EurocampClientError, attempt: number): boolean {
    return error instanceof BadGatewayError && attempt < this.retries;
  }

  private mapError(error: unknown): EurocampClientError {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return new TimeoutError('Request timed out', undefined, error);
      }

      const statusCode = error.response?.status;

      if (statusCode === 404) {
        return new NotFoundError('Resource not found', statusCode, error);
      }

      if (statusCode === 502) {
        return new BadGatewayError('Upstream API returned 502', statusCode, error);
      }

      if (typeof statusCode === 'number') {
        return new HttpStatusError(`Unexpected HTTP status ${statusCode}`, statusCode, error);
      }

      return new EurocampClientError(`Request failed: ${error.message}`, undefined, error);
    }

    if (error instanceof EurocampClientError) {
      return error;
    }

    if (error instanceof Error) {
      return new EurocampClientError(error.message, undefined, error);
    }

    return new EurocampClientError('Unknown request failure');
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
