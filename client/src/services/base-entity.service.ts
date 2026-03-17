import { MemoryCache } from '../cache';
import { InvalidResponseError } from '../errors';
import { HttpClient } from '../http-client';
import type { ApiListResponse } from '../types';

export class BaseEntityService<TEntity, TCreateInput> {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly cache: MemoryCache,
    private readonly resourcePath: string,
    private readonly cacheTtlMs: number
  ) {}

  async list(): Promise<TEntity[]> {
    const cacheKey = `${this.resourcePath}:list`;
    const cached = this.cache.get<TEntity[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await this.httpClient.get<ApiListResponse<TEntity>>(this.resourcePath);

    if (!response || !Array.isArray(response.data)) {
      throw new InvalidResponseError(`Invalid list response for ${this.resourcePath}`);
    }

    this.cache.set(cacheKey, response.data, this.cacheTtlMs);
    return response.data;
  }

  async get(id: string): Promise<TEntity> {
    const cacheKey = `${this.resourcePath}:${id}`;
    const cached = this.cache.get<TEntity>(cacheKey);

    if (cached) {
      return cached;
    }

    const entity = await this.httpClient.get<TEntity>(`${this.resourcePath}/${id}`);
    this.cache.set(cacheKey, entity, this.cacheTtlMs);
    return entity;
  }

  async create(payload: TCreateInput): Promise<TEntity> {
    const entity = await this.httpClient.post<TEntity>(this.resourcePath, payload);
    this.cache.clearByPrefix(this.resourcePath);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete<void>(`${this.resourcePath}/${id}`);
    this.cache.delete(`${this.resourcePath}:${id}`);
    this.cache.delete(`${this.resourcePath}:list`);
  }
}
