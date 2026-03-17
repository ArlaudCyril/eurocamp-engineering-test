import { MemoryCache } from '../cache';
import { HttpClient } from '../http-client';
import type { CreateUserInput, User } from '../types';
import { BaseEntityService } from './base-entity.service';

export class UsersService extends BaseEntityService<User, CreateUserInput> {
  constructor(httpClient: HttpClient, cache: MemoryCache, cacheTtlMs: number) {
    super(httpClient, cache, '/users', cacheTtlMs);
  }
}
