# Frontend Task

This folder contains a small React + TypeScript frontend for the Eurocamp frontend task.

## Features

- Tailwind CSS styling with local shadcn-style UI components
- reads users, parcs, and bookings from the provided API
- surfaces API failures clearly to the user
- supports detail inspection on all three resources
- includes small create flows for users, parcs, and bookings
- reuses the shared TypeScript client from `client/`

## Run it

From the repository root:

1. `npm install --force`
2. `docker compose up -d --force-recreate`
3. `docker exec engineering-test-eurocamp-api-1 npm run seed:run`
4. `npm run frontend:check`
5. `npm run frontend:test`
6. `npm run frontend:dev`

Then open `http://localhost:4173`.

Optional environment variable:

- `VITE_EUROCAMP_BASE_URL=http://localhost:3001/api/1`
