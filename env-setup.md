---
phase: "P6 CI/CD & Env"
gate: "Review Gate"
status: "environment schemas enforced and CI respects strict loading."
previous:
  - "/devops-automation"
next:
  - "/secrets-manager-setup"
  - "/iac-bootstrap"
---

# Env Setup

**Trigger:** `/env-setup`

**Purpose:** Create `.env.example`, runtime schema validation, and per‑env overrides.

**Steps:**

1. Scan repo for `process.env` usage and collected keys.
2. Emit `.env.example` with comments and safe defaults.
3. Add runtime validation via `zod` or `envsafe` in `packages/config`.
4. Document `development`, `staging`, `production` precedence and loading order.

**Output format:** `.env.example` content block and `config/env.ts` snippet.

**Examples:** `/env-setup`.

**Notes:** Do not include real credentials. Enforce `STRICT_ENV=true` in CI.

