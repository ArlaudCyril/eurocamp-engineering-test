import {
  BadGatewayError,
  EurocampClientError,
  NotFoundError,
  TimeoutError,
} from '@client/errors';

export type ResourceState<T> = {
  items: T[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selected: T | null;
  selectedError: string | null;
  detailLoading: boolean;
};

export function createEmptyResourceState<T>(): ResourceState<T> {
  return {
    items: [],
    loading: false,
    error: null,
    lastUpdated: null,
    selected: null,
    selectedError: null,
    detailLoading: false,
  };
}

export function formatFrontendError(error: unknown): string {
  if (error instanceof BadGatewayError) {
    return 'The API is temporarily unstable right now. Please retry in a moment.';
  }

  if (error instanceof TimeoutError) {
    return 'The request took too long to complete. Please try again.';
  }

  if (error instanceof NotFoundError) {
    return 'The requested record could not be found anymore.';
  }

  if (error instanceof EurocampClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function nextBookingDateValue(baseDate = new Date()): string {
  const nextDay = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  const year = nextDay.getFullYear();
  const month = String(nextDay.getMonth() + 1).padStart(2, '0');
  const day = String(nextDay.getDate()).padStart(2, '0');
  const hours = String(nextDay.getHours()).padStart(2, '0');
  const minutes = String(nextDay.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
