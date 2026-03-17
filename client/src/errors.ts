export class EurocampClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class HttpStatusError extends EurocampClientError {}

export class TimeoutError extends EurocampClientError {}

export class NotFoundError extends EurocampClientError {}

export class BadGatewayError extends EurocampClientError {}

export class InvalidResponseError extends EurocampClientError {}
