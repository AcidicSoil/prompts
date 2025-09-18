# Scaffold Full‑Stack App

**Trigger:** `/scaffold-fullstack <stack>`

**Purpose:** Create a minimal, production‑ready monorepo template with app, API, tests, CI seeds, and infra stubs.

**Steps:**

1. Read repository context: `git rev-parse --is-inside-work-tree`.
2. If repo is empty, initialize: `git init -b main` and create `.editorconfig`, `.gitignore`, `README.md`.
3. For `<stack>` derive presets (examples):
   - `ts-next-express-pg`: Next.js app, Express API, Prisma + PostgreSQL, Playwright, pnpm workspaces.
   - `ts-vite-fastify-sqlite`: Vite + React app, Fastify API, Drizzle + SQLite.
4. Create workspace layout:
   - root: `package.json` with `pnpm` workspaces, `tsconfig.base.json`, `eslint`, `prettier`.
   - apps/web, apps/api, packages/ui, packages/config.
5. Add scripts:
   - root: `dev`, `build`, `lint`, `typecheck`, `test`, `e2e`, `format`.
   - web: Next/Vite scripts. api: dev with ts-node or tsx.
6. Seed CI files: `.github/workflows/ci.yml` with jobs [lint, typecheck, test, build, e2e] and artifact uploads.
7. Add example routes:
   - web: `/health` page. api: `GET /health` returning `{ ok: true }`.
8. Write docs to `README.md`: how to run dev, test, build, and env variables.
9. Stage files, but do not commit. Output a tree and next commands.

**Output format:**

- Title line: `Scaffold created: <stack>`
- Sections: `Repo Tree`, `Next Steps`, `CI Seeds`.
- Include a fenced code block of the `tree` and sample scripts.

**Examples:**

- **Input:** `/scaffold-fullstack ts-next-express-pg`
  **Output:** Summary + tree with `apps/web`, `apps/api`, `packages/ui`.
- **Input:** `/scaffold-fullstack ts-vite-fastify-sqlite`
  **Output:** Summary + tree + Drizzle config.

**Notes:**

- Assume pnpm and Node 20+. Do not run package installs automatically; propose commands instead.
- Respect existing files; avoid overwriting without explicit confirmation.
