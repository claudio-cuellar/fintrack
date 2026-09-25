# FinTrack

FinTrack is a modular-monolith SaaS foundation for personal and family expense tracking. The MVP uses a generic workspace tenant boundary with `PERSONAL` and `FAMILY` workspace types, fixed server-side RBAC, a unified transaction model, PostgreSQL, NestJS, and Angular 21.

## Architecture

The complete architecture decision record is in [`docs/architecture.md`](docs/architecture.md). Rendered system, ERD, and deployment diagrams are in [`docs/diagrams`](docs/diagrams). The incremental Angular microfrontend setup is documented in [`docs/microfrontend.md`](docs/microfrontend.md).

## Local prerequisites

Install Node.js 22 LTS, pnpm 10, and Docker Desktop or Docker Engine with Compose. Copy the environment template into both the repository root and the API directory. Prisma commands run with `apps/api` as their project directory, so the API-local file is required when invoking Prisma directly from that package.

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
docker compose up -d
pnpm install
pnpm --filter @fintrack/api prisma:generate
pnpm --filter @fintrack/api prisma:migrate
pnpm --filter @fintrack/api prisma:seed
pnpm dev
```

The `.env` files are ignored by Git. Keep the example values for local development only and replace the JWT secret before running any authenticated environment. If you only need to fix the immediate Prisma error, run `cp apps/api/.env.example apps/api/.env` from the repository root, then rerun your Prisma command.

The API is served at `http://localhost:3000/api/v1`, Swagger is at `http://localhost:3000/api/v1/docs`, the Shell is at `http://localhost:4200`, Expenses is at `http://localhost:4201`, and Mailpit is at `http://localhost:8025`.

## Microfrontend development

```bash
pnpm dev:shell
pnpm dev:expenses
pnpm dev:local --apps expenses
pnpm build:shell
pnpm build:expenses
```

The Shell resolves remote URLs through `apps/shell/src/assets/mfe.manifest.json`. Machine-specific overrides belong in the ignored `apps/shell/src/assets/mfe.manifest.local.json`; copy the example manifest described in [`docs/microfrontend.md`](docs/microfrontend.md).

## Safety notes

This repository is a reference implementation foundation, not a declaration of compliance or a replacement for a security review. Production deployment must use managed secrets, a verified TLS/CSRF strategy, audited authorization tests, private object storage, database backups, and operational monitoring. Do not use the example credentials outside local development.
