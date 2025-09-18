# Planning Process

Trigger: /planning-process

Purpose: Draft, refine, and execute a feature plan with strict scope control and progress tracking.

## Steps

1. If no plan file exists, create `PLAN.md`. If it exists, load it.
2. Draft sections: **Goal**, **User Story**, **Milestones**, **Tasks**, **Won't do**, **Ideas for later**, **Validation**, **Risks**.
3. Trim bloat. Convert vague bullets into testable tasks with acceptance criteria.
4. Tag each task with an owner and estimate. Link to files or paths that will change.
5. Maintain two backlogs: **Won't do** (explicit non-goals) and **Ideas for later** (deferrable work).
6. Mark tasks done after tests pass. Append commit SHAs next to completed items.
7. After each milestone: run tests, update **Validation**, then commit `PLAN.md`.

## Output format

- Update or create `PLAN.md` with the sections above.
- Include a checklist for **Tasks**. Keep lines under 100 chars.

## Examples
**Input**: "Add OAuth login"

**Output**:

- Goal: Let users sign in with Google.
- Tasks: [ ] add Google client, [ ] callback route, [ ] session, [ ] E2E test.
- Won't do: org SSO.
- Ideas for later: Apple login.

## Notes

- Planning only. No code edits.
- Assume a Git repo with test runner available.

## Stage alignment

- **Phase**: [P1 Plan & Scope](WORKFLOW.md#p1-plan--scope)
- **Gate**: Scope Gate — confirm problem, users, Done criteria, and stack risks are logged.
- **Previous prompts**: Preflight Docs (AGENTS baseline)
- **Next prompts**: `/scope-control`, `/stack-evaluation`
