import { MemoryCache } from './cache';
import { HttpClient } from './http-client';
import { BookingsService } from './services/bookings.service';
import { ParcsService } from './services/parcs.service';
import { UsersService } from './services/users.service';
import type {
  Booking,
  ClientOptions,
  CreateBookingInput,
  CreateParcInput,
  CreateUserInput,
  Parc,
  User,
} from './types';

const DEFAULT_CACHE_TTL_MS = 10000;

export class EurocampClient {
  readonly users: UsersService;
  readonly parcs: ParcsService;
  readonly bookings: BookingsService;

  constructor(options: ClientOptions = {}) {
    const cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    const httpClient = new HttpClient(options);
    const cache = new MemoryCache(cacheTtlMs);

    this.users = new UsersService(httpClient, cache, cacheTtlMs);
    this.parcs = new ParcsService(httpClient, cache, cacheTtlMs);
    this.bookings = new BookingsService(httpClient, cache, cacheTtlMs);
  }

  listUsers(): Promise<User[]> {
    return this.users.list();
  }

  getUser(id: string): Promise<User> {
    return this.users.get(id);
  }

  createUser(payload: CreateUserInput): Promise<User> {
    return this.users.create(payload);
  }

  deleteUser(id: string): Promise<void> {
    return this.users.delete(id);
  }

  listParcs(): Promise<Parc[]> {
    return this.parcs.list();
  }

  getParc(id: string): Promise<Parc> {
    return this.parcs.get(id);
  }

  createParc(payload: CreateParcInput): Promise<Parc> {
    return this.parcs.create(payload);
  }

  deleteParc(id: string): Promise<void> {
    return this.parcs.delete(id);
  }

  listBookings(): Promise<Booking[]> {
    return this.bookings.list();
  }

  getBooking(id: string): Promise<Booking> {
    return this.bookings.get(id);
  }

  createBooking(payload: CreateBookingInput): Promise<Booking> {
    return this.bookings.create(payload);
  }

  deleteBooking(id: string): Promise<void> {
    return this.bookings.delete(id);
  }
}
