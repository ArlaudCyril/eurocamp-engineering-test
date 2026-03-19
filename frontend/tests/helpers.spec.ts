/// <reference types="jest" />

import { BadGatewayError, TimeoutError } from '../../client/src/errors';
import {
  createEmptyResourceState,
  formatFrontendError,
  nextBookingDateValue,
} from '../src/helpers';

describe('frontend helpers', () => {
  it('maps flaky upstream failures to a user-friendly message', () => {
    expect(formatFrontendError(new BadGatewayError('boom', 502))).toBe(
      'The API is temporarily unstable right now. Please retry in a moment.'
    );
  });

  it('maps timeout failures to a user-friendly message', () => {
    expect(formatFrontendError(new TimeoutError('Request timed out'))).toBe(
      'The request took too long to complete. Please try again.'
    );
  });

  it('creates an empty resource state with safe defaults', () => {
    expect(createEmptyResourceState<string>()).toEqual({
      items: [],
      loading: false,
      error: null,
      lastUpdated: null,
      selected: null,
      selectedError: null,
      detailLoading: false,
    });
  });

  it('builds a datetime-local value for the next day', () => {
    expect(nextBookingDateValue(new Date(2026, 2, 19, 8, 45, 0, 0))).toBe('2026-03-20T08:45');
  });
});
