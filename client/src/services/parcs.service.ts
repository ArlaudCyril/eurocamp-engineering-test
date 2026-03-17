import { MemoryCache } from '../cache';
import { HttpClient } from '../http-client';
import type { CreateParcInput, Parc } from '../types';
import { BaseEntityService } from './base-entity.service';

export class ParcsService extends BaseEntityService<Parc, CreateParcInput> {
  constructor(httpClient: HttpClient, cache: MemoryCache, cacheTtlMs: number) {
    super(httpClient, cache, '/parcs', cacheTtlMs);
  }
}
