---
phase: "P3 Data & Auth"
gate: "Migration dry-run"
status: "auth flows threat-modeled and test accounts wired."
previous:
  - "/migration-plan"
next:
  - "/modular-architecture"
  - "/ui-screenshots"
  - "/e2e-runner-setup"
---

# Auth Scaffold

**Trigger:** `/auth-scaffold <oauth|email|oidc>`

**Purpose:** Scaffold auth flows, routes, storage, and a basic threat model.

**Steps:**

1. Select provider (OAuth/OIDC/email) and persistence for sessions.
2. Generate routes: login, callback, logout, session refresh.
3. Add CSRF, state, PKCE where applicable. Include secure cookie flags.
4. Document threat model: replay, fixation, token leakage, SSRF on callbacks.
5. Wire to frontend with protected routes and user context.

**Output format:** route list, config keys, and mitigations table.

**Examples:** `/auth-scaffold oauth` → NextAuth/Passport/Custom adapter plan.

**Notes:** Never print real secrets. Use placeholders in `.env.example`.

