# Backend Client

This folder contains a small TypeScript client for Eurocamp Task 3.

## Design choices

- `axios` was used because it is already present in the repository
- retries are limited to transient `502` responses
- a small in-memory cache is used for read operations only
- the API itself is not modified; the client consumes the existing API under `/api/1`

## Default configuration

- Base URL: `http://localhost:3001/api/1`
- Timeout: `1500ms`
- Retries on `502`: `2` additional attempts
- Cache TTL: `10000ms`

All of these values can be overridden when instantiating `EurocampClient`.

## Run the API first

From the repository root:

1. `npm install --force`
2. `docker compose up -d --force-recreate`
3. `docker exec engineering-test-eurocamp-api-1 npm run seed:run`

If your Docker container name differs, check it with `docker compose ps`.

## Run the client checks

From the repository root:

1. `npm run client:test`
2. `npm run client:check`

## Run the demo

From the repository root:

1. `npm run client:demo`

Optional environment variable:

- `EUROCAMP_BASE_URL=http://localhost:3001/api/1`

## Covered behavior

- typed methods for users, parcs, and bookings
- retry with exponential backoff on `502`
- no retry on `404`
- in-memory TTL cache for list and detail reads
- cache invalidation after create and delete
