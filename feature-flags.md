# Feature Flags

**Trigger:** `/feature-flags <provider>`

**Purpose:** Integrate a flag provider, wire SDK, and enforce guardrails.

**Steps:**

1. Select provider (LaunchDarkly, Unleash, Flagsmith, custom).
2. Add SDK init in web/api with bootstrap values and offline mode for dev.
3. Define flag naming and ownership. Add kill‑switch pattern and monitoring.

**Output format:** SDK snippet, example usage, and guardrail checklist.

**Examples:** `/feature-flags launchdarkly`.

**Notes:** Ensure flags are typed and expire with tickets.
