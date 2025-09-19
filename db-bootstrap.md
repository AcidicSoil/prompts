---
phase: "P3 Data & Auth"
gate: "Migration dry-run"
status: "migrations apply/rollback cleanly with seeds populated."
previous:
  - "/modular-architecture"
next:
  - "/migration-plan"
  - "/auth-scaffold"
---

# DB Bootstrap

**Trigger:** `/db-bootstrap <postgres|mysql|sqlite|mongodb>`

**Purpose:** Pick a database, initialize migrations, local compose, and seed scripts.

**Steps:**

1. Create `db/compose.yaml` for local dev (skip for sqlite).
2. Choose ORM/driver (Prisma or Drizzle for SQL). Add migration config.
3. Create `prisma/schema.prisma` or `drizzle/*.ts` with baseline tables (users, sessions, audit_log).
4. Add `pnpm db:migrate`, `db:reset`, `db:seed` scripts. Write seed data for local admin user.
5. Update `.env.example` with `DATABASE_URL` and test connection script.

**Output format:** Migration plan list and generated file paths.

**Examples:** `/db-bootstrap postgres` → Prisma + Postgres docker-compose.

**Notes:** Avoid destructive defaults; provide `--preview-feature` warnings if relevant.

