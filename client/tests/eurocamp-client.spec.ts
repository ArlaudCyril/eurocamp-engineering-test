import { InvalidResponseError } from '../src/errors';
import { EurocampClient } from '../src/eurocamp-client';

describe('EurocampClient', () => {
  it('caches list requests', async () => {
    const transport = {
      request: jest.fn().mockResolvedValue({
        data: {
          data: [{ id: 'user-1', name: 'Alice', email: 'alice@example.com' }],
        },
      }),
    };

    const client = new EurocampClient({
      transport,
      cacheTtlMs: 60000,
    });

    const firstResult = await client.listUsers();
    const secondResult = await client.listUsers();

    expect(firstResult).toEqual(secondResult);
    expect(transport.request).toHaveBeenCalledTimes(1);
  });

  it('invalidates the cached list after creating a record', async () => {
    const transport = {
      request: jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            data: [{ id: 'user-1', name: 'Alice', email: 'alice@example.com' }],
          },
        })
        .mockResolvedValueOnce({
          data: { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
        })
        .mockResolvedValueOnce({
          data: {
            data: [
              { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
              { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
            ],
          },
        }),
    };

    const client = new EurocampClient({
      transport,
      cacheTtlMs: 60000,
    });

    await client.listUsers();
    await client.createUser({ name: 'Bob', email: 'bob@example.com' });
    const refreshedUsers = await client.listUsers();

    expect(refreshedUsers).toHaveLength(2);
    expect(transport.request).toHaveBeenCalledTimes(3);
  });

  it('rejects invalid list payloads', async () => {
    const transport = {
      request: jest.fn().mockResolvedValue({
        data: { items: [] },
      }),
    };

    const client = new EurocampClient({
      transport,
    });

    await expect(client.listUsers()).rejects.toBeInstanceOf(InvalidResponseError);
  });
});
