import type { AxiosError, AxiosResponse } from 'axios';
import { BadGatewayError, NotFoundError, TimeoutError } from '../src/errors';
import { HttpClient } from '../src/http-client';

describe('HttpClient', () => {
  it('retries bad gateway responses before succeeding', async () => {
    const transport = {
      request: jest
        .fn()
        .mockRejectedValueOnce(createAxiosError(502))
        .mockRejectedValueOnce(createAxiosError(502))
        .mockResolvedValueOnce({
          data: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
        }),
    };

    const client = new HttpClient({
      transport,
      retries: 2,
      retryDelayMs: 0,
    });

    const result = await client.get<{ id: string; name: string; email: string }>('/users/user-1');

    expect(result).toEqual({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
    });
    expect(transport.request).toHaveBeenCalledTimes(3);
  });

  it('does not retry a not found response', async () => {
    const transport = {
      request: jest.fn().mockRejectedValueOnce(createAxiosError(404)),
    };

    const client = new HttpClient({
      transport,
      retries: 2,
      retryDelayMs: 0,
    });

    await expect(client.get('/users/missing')).rejects.toBeInstanceOf(NotFoundError);
    expect(transport.request).toHaveBeenCalledTimes(1);
  });

  it('maps timeout errors explicitly', async () => {
    const transport = {
      request: jest.fn().mockRejectedValueOnce(createTimeoutError()),
    };

    const client = new HttpClient({
      transport,
      retryDelayMs: 0,
    });

    await expect(client.get('/users')).rejects.toBeInstanceOf(TimeoutError);
  });
});

function createAxiosError(status: number): AxiosError {
  return {
    name: 'AxiosError',
    message: `Request failed with status code ${status}`,
    isAxiosError: true,
    toJSON: () => ({}),
    config: {},
    response: {
      status,
      statusText: 'Error',
      headers: {},
      config: {},
      data: {},
    } as AxiosResponse,
  } as AxiosError;
}

function createTimeoutError(): AxiosError {
  return {
    name: 'AxiosError',
    message: 'timeout exceeded',
    code: 'ECONNABORTED',
    isAxiosError: true,
    toJSON: () => ({}),
    config: {},
  } as AxiosError;
}
