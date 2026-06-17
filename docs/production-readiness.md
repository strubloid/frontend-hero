# Production Readiness Runbook

This runbook captures the Phase 8 production readiness baseline for Frontend Realms.

## Verification Gates

Run before every deployment:

```bash
npm run verify:full
npm run audit:production
npm run audit:dependencies
```

Expected result:

- Prettier check passes
- ESLint passes
- TypeScript strict check passes
- Production audit reports 0 errors
- Next.js production build passes
- Vitest suite passes

## CI

GitHub Actions workflow:

- `.github/workflows/ci.yml`
- Runs on pushes to `main` and pull requests
- Uses Node.js 20 with npm cache
- Executes `npm ci` then `npm run verify:full`

## Deployment Target

Primary target: Fly.io using Docker.

Files:

- `Dockerfile` — multi-stage Next.js standalone image
- `fly.toml` — Fly app configuration with HTTPS and health checks
- `/api/health` — runtime health endpoint

Commands:

```bash
npm run docker:build
npm run docker:verify
npm run fly:validate
npm run fly:deploy
npm run fly:status
npm run fly:logs
```

## Required Runtime Environment

Current app has no mandatory secrets for the in-memory gameplay path.

Future PostgreSQL production wiring should use secrets, not public env vars:

```bash
fly secrets set DATABASE_URL=postgres://...
```

Never expose secrets through `NEXT_PUBLIC_*`.

## Health Check

Endpoint:

```text
GET /api/health
```

Success response:

```json
{
  "status": "ok",
  "service": "frontend-realms",
  "timestamp": "<iso timestamp>"
}
```

The endpoint is dynamic and `Cache-Control: no-store`.

## Security Baseline

Implemented:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling camera, microphone, geolocation, browsing topics
- Production audit checks for likely leaked public secrets and hardcoded credential-like values
- Dependency audit gate fails on high/critical advisories via `npm run audit:dependencies`

Known dependency-advisory note:

- `npm audit` currently reports moderate advisories in transitive development/build dependencies (`drizzle-kit` / `esbuild` path and Next/PostCSS path).
- Available automatic fixes require breaking dependency changes, so they are documented as a monitored risk rather than force-applied.
- Revisit when compatible upstream releases are available.

Manual review checklist:

- No hardcoded credentials in source, docs, CI, or deployment config
- No secrets with `NEXT_PUBLIC_` prefix
- API routes validate expected request shape before invoking actions
- Error UI does not expose stack traces to users
- Deployment secrets configured only via Fly secrets

## Accessibility Baseline

Manual audit checklist:

- Keyboard navigation works on all route-level pages
- Buttons have visible text or `aria-label`
- Loading, empty, and error states are visible and understandable
- Color contrast remains readable on dark backgrounds
- Icon-only close buttons include accessible labels when introduced
- Forms and interactive controls have programmatic labels

## Performance Baseline

Implemented:

- Next.js `output: "standalone"` for compact Docker runtime
- Production build route summary is part of `npm run verify`
- Particle canvas disabled on mobile for world map performance
- Skeleton states reduce perceived loading latency

Manual profiling checklist:

- Run `npm run build` and inspect route output for unexpected dynamic routes
- Test `/`, `/world-map`, `/play`, `/profile`, `/collections`, `/boss-encounter` on mobile viewport
- Avoid introducing large client dependencies without documenting why
- Keep route-level client components scoped to interactive pages only

## Observability and Error Reporting

Current baseline:

- Route-level error boundaries for supported routes
- Global error boundary and not-found page
- Health endpoint for uptime monitoring
- Fly logs available through `npm run fly:logs`

Future error-reporting integration:

- Add a server/client error reporter provider behind env-gated config
- Do not send PII or answer content by default
- Sample high-volume client errors
- Include route, build version, and event type metadata only

## Release Procedure

1. Confirm clean working tree or expected uncommitted changes.
2. Run `npm run verify:full`.
3. Run `npm run audit:production`.
4. Validate Fly config: `npm run fly:validate`.
5. Build Docker image: `npm run docker:build` or `npm run docker:verify`.
6. Deploy: `npm run fly:deploy`.
7. Confirm health: visit `/api/health` on production URL.
8. Check logs: `npm run fly:logs`.
9. Smoke test: `/`, `/world-map`, `/play`, `/profile`, `/collections`, `/boss-encounter`.

## Rollback Procedure

1. Inspect recent Fly releases:

```bash
fly releases
```

2. Roll back to the last known-good release:

```bash
fly deploy --image <previous-image>
```

3. Confirm `/api/health` returns `status: ok`.
4. Check logs and smoke-test critical routes.
