# OpenAPI Generate

**Trigger:** `/openapi-generate <server|client> <lang> <spec-path>`

**Purpose:** Generate server stubs or typed clients from an OpenAPI spec.

**Steps:**

1. Validate `<spec-path>`; fail with actionable errors.
2. For `server`, generate controllers, routers, validation, and error middleware into `apps/api`.
3. For `client`, generate a typed SDK into `packages/sdk` with fetch wrapper and retry/backoff.
4. Add `make generate-api` or `pnpm sdk:gen` scripts and CI step to verify no drift.
5. Produce a diff summary and TODO list for unimplemented handlers.

**Output format:** summary table of generated paths, scripts to add, and next actions.

**Examples:** `/openapi-generate client ts apis/auth/openapi.yaml`.

**Notes:** Prefer openapi-typescript + zod for TS clients when possible.
