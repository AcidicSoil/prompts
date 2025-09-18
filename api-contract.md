# API Contract

**Trigger:** `/api-contract "<feature or domain>"`

**Purpose:** Author an initial OpenAPI 3.1 or GraphQL SDL contract from requirements.

**Steps:**

1. Parse inputs and existing docs. If REST, prefer OpenAPI 3.1 YAML; if GraphQL, produce SDL.
2. Define resources, operations, request/response schemas, error model, auth, and rate limit headers.
3. Add examples for each endpoint or type. Include pagination and filtering conventions.
4. Save to `apis/<domain>/openapi.yaml` or `apis/<domain>/schema.graphql`.
5. Emit changelog entry `docs/api/CHANGELOG.md` with rationale and breaking-change flags.

**Output format:**

- `Contract Path`, `Design Notes`, and a fenced code block with the spec body.

**Examples:**

- `/api-contract "accounts & auth"` → `apis/auth/openapi.yaml` with OAuth 2.1 flows.

**Notes:**

- Follow JSON:API style for REST unless caller specifies otherwise. Include `429` and `5xx` models.

## Stage alignment

- **Phase**: [P2 App Scaffold & Contracts](WORKFLOW.md#p2-app-scaffold--contracts)
- **Gate**: Test Gate lite — contract checked into repo with sample generation running cleanly.
- **Previous prompts**: `/scaffold-fullstack`
- **Next prompts**: `/openapi-generate`, `/modular-architecture`
