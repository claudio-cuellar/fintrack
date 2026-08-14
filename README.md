# FinTrack

FinTrack is a modular-monolith SaaS foundation for personal and family expense tracking. The MVP uses a generic workspace tenant boundary with `PERSONAL` and `FAMILY` workspace types, fixed server-side RBAC, a unified transaction model, PostgreSQL, NestJS, and Angular 21.

## Architecture

The complete architecture decision record is in [`docs/architecture.md`](docs/architecture.md). Rendered system, ERD, and deployment diagrams are in [`docs/diagrams`](docs/diagrams).

## Local prerequisites

Install Node.js 22 LTS, pnpm 10, and Docker Desktop or Docker Engine with Compose. Copy `.env.example` to `.env` and replace the JWT secret before running any authenticated environment.

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The API is served at `http://localhost:3000/api/v1`, Swagger is at `http://localhost:3000/api/v1/docs`, the web application is at `http://localhost:4200`, and Mailpit is at `http://localhost:8025`.

## Safety notes

This repository is a reference implementation foundation, not a declaration of compliance or a replacement for a security review. Production deployment must use managed secrets, a verified TLS/CSRF strategy, audited authorization tests, private object storage, database backups, and operational monitoring. Do not use the example credentials outside local development.
