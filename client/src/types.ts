import type { AxiosInstance } from 'axios';

export interface ApiListResponse<T> {
  data: T[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface Parc {
  id: string;
  name: string;
  description: string;
}

export interface CreateParcInput {
  name: string;
  description: string;
}

export interface Booking {
  id: string;
  user: string;
  parc: string;
  bookingdate: string;
  comments?: string;
}

export interface CreateBookingInput {
  user: string;
  parc: string;
  bookingdate: string;
  comments?: string;
}

export interface ClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  cacheTtlMs?: number;
  transport?: Pick<AxiosInstance, 'request'>;
}
