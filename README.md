# FinTrack

FinTrack is a modular-monolith SaaS foundation for personal and family expense tracking. The MVP uses a generic workspace tenant boundary with `PERSONAL` and `FAMILY` workspace types, fixed server-side RBAC, a unified transaction model, PostgreSQL, NestJS, and Angular 21.

## Architecture

The complete architecture decision record is in [`docs/architecture.md`](docs/architecture.md). Rendered system, ERD, and deployment diagrams are in [`docs/diagrams`](docs/diagrams).

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

The API is served at `http://localhost:3000/api/v1`, Swagger is at `http://localhost:3000/api/v1/docs`, the web application is at `http://localhost:4200`, and Mailpit is at `http://localhost:8025`.

## Safety notes

This repository is a reference implementation foundation, not a declaration of compliance or a replacement for a security review. Production deployment must use managed secrets, a verified TLS/CSRF strategy, audited authorization tests, private object storage, database backups, and operational monitoring. Do not use the example credentials outside local development.
