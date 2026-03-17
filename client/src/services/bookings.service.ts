import { MemoryCache } from '../cache';
import { HttpClient } from '../http-client';
import type { Booking, CreateBookingInput } from '../types';
import { BaseEntityService } from './base-entity.service';

export class BookingsService extends BaseEntityService<Booking, CreateBookingInput> {
  constructor(httpClient: HttpClient, cache: MemoryCache, cacheTtlMs: number) {
    super(httpClient, cache, '/bookings', cacheTtlMs);
  }
}
