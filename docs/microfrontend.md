# FinTrack Microfrontend Development

The frontend is incrementally migrating from the former single `apps/web` application to a Native Federation host and remote architecture.

## Current applications

- `apps/shell` is the host. It owns bootstrap, layout, navigation, authentication, workspace context, and top-level routes.
- `apps/expenses` is the first remote. It exposes `./Routes` and currently owns the existing Transactions screen under `/expenses`.
- `apps/api` remains the single NestJS modular-monolith backend.
- `packages/shared` is the compiled partial-Ivy workspace library shared by Shell and Expenses. It owns authentication, the auth guard/interceptor, workspace context, i18n, and the `/api/v1` path contract.

The remaining dashboard, family, reports, accounts, categories, and settings features remain in the Shell during the first migration slice. They will be extracted one at a time after the Shell/Expenses boundary is stable.

## Commands

```bash
pnpm install
pnpm dev:shell       # Start only the Shell
pnpm dev:expenses    # Start Expenses independently on port 4201
pnpm dev             # Start API + Shell + Expenses locally
pnpm dev:api         # Start only the API
pnpm dev:local       # Start API + Shell + Expenses locally
pnpm dev:local --apps expenses
pnpm --filter @fintrack/shared build
pnpm build:shell
pnpm build:expenses
pnpm typecheck
pnpm test
```

The Shell runs on port 4200. Expenses runs on port 4201.

Both Angular applications explicitly attach `proxy.conf.json` to their underlying development-server target. Requests to `/api/**` are forwarded to `http://localhost:3000` without rewriting the path, so `/api/v1/...` reaches the NestJS API unchanged. The composed `pnpm dev`/`pnpm dev:local` command starts the API together with the frontend processes; running only `pnpm dev:shell` or `pnpm dev:expenses` requires an API already running on port 3000.

## Runtime manifest

The Shell loads `apps/shell/src/assets/mfe.manifest.json` at startup. It then optionally loads the untracked file `apps/shell/src/assets/mfe.manifest.local.json` and merges only its remote definitions.

Create a local override with:

```bash
cp apps/shell/src/assets/mfe.manifest.local.example.json \
  apps/shell/src/assets/mfe.manifest.local.json
```

A production deployment should replace the checked-in development URL with the deployed remote URL from `mfe.manifest.production.example.json`, for example:

```json
{
  "version": 1,
  "remotes": {
    "expenses": {
      "url": "https://cdn.example.com/fintrack/expenses/remoteEntry.json",
      "enabled": true
    }
  }
}
```

The manifest is the only place where remote URLs are resolved. Routes refer to the logical remote name `expenses`, not to localhost or cloud URLs.

## Federation behavior

Native Federation is pinned to `21.2.6`, matching the Angular 21 toolchain. Angular, Router, RxJS, and `@fintrack/shared` are shared as singleton dependencies by the federation configurations. The shared package is built with ng-packagr in partial-Ivy mode before federation builds.

Expenses exposes:

```text
./Routes → apps/expenses/src/app/remote.routes.ts
```

The Shell dynamically loads that route collection for both `/expenses` and the legacy `/transactions` alias. If the remote cannot be loaded, the Shell renders an isolated unavailable state instead of failing the entire application.

## Current limitation

The migration phase has been verified through independent production builds, type checking, linting, unit tests, generated `remoteEntry.json` artifacts, and the Angular configuration wiring for both proxy targets. Browser-level Shell-to-remote loading should be run in an environment that exposes the dev server port to the test client. The federation output is ready for static hosting under the remote's release directory.
