---
phase: "P5 Quality Gates & Tests"
gate: "Test Gate"
status: "runner green locally and wired into CI before expanding coverage."
previous:
  - "/auth-scaffold"
  - "/ui-screenshots"
next:
  - "/integration-test"
  - "/coverage-guide"
---

# E2E Runner Setup

**Trigger:** `/e2e-runner-setup <playwright|cypress>`

**Purpose:** Configure an end‑to‑end test runner with fixtures and data sandbox.

**Steps:**

1. Install runner and add config with baseURL, retries, trace/videos on retry only.
2. Create fixtures for auth, db reset, and network stubs. Add `test:serve` script.
3. Provide CI job that boots services, runs E2E, uploads artifacts.

**Output format:** file list, scripts, and CI snippet fenced code block.

**Examples:** `/e2e-runner-setup playwright`.

**Notes:** Keep runs under 10 minutes locally; parallelize spec files.

