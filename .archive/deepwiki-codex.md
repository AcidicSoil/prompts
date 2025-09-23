## Summary This repository packages a catalog of Codex CLI prompts and `/gemini-map` templates that guide an end-to-end software delivery workflow, from planning and scaffolding through testing, release, and post-release hardening.​:codex-file-citation[codex-file-citation]{line_range_start=1 line_range_end=156 path=README.md git_url="https://github.com/AcidicSoil/prompts/blob/main/README.md#L1-L156"}​ The prompts live as Markdown files at the repo root, with supporting workflow documentation (`WORKFLOW.md`, `workflow.mmd`) describing phase gates and expected sequences across the development cycle.​:codex-file-citation[codex-file-citation]{line_range_start=93 line_range_end=156 path=README.md git_url="https://github.com/AcidicSoil/prompts/blob/main/README.md#L93-L156"}​​:codex-file-citation[codex-file-citation]{line_range_start=1 line_range_end=170 path=WORKFLOW.md git_url="https://github.com/AcidicSoil/prompts/blob/main/WORKFLOW.md#L1-L170"}​## Architecture / Dependency View ``` prompts/ ├── *.md (direct slash commands per lifecycle activity) ├── *.md with front matter (Gemini→Codex templates grouped by theme) ├── WORKFLOW.md (phase definitions P0–P9 with gate criteria) ├── workflow.mmd (Mermaid depiction of prompt ordering) └── codefetch/… (reference config snippets for prompt outputs) ``` These pieces interact by having agents invoke individual prompt files while consulting `WORKFLOW.md`/`workflow.mmd` for stage sequencing and reference assets for consistent outputs.​:codex-file-citation[codex-file-citation]{line_range_start=17 line_range_end=156 path=README.md git_url="https://github.com/AcidicSoil/prompts/blob/main/README.md#L17-L156"}​​:codex-file-citation[codex-file-citation]{line_range_start=33 line_range_end=170 path=WORKFLOW.md git_url="https://github.com/AcidicSoil/prompts/blob/main/WORKFLOW.md#L33-L170"}​## Key Files - `README.md` – Installation instructions, prompt catalog, and a high-level Mermaid flow linking prompts across planning-to-release phases.​:codex-file-citation[codex-file-citation]{line_range_start=5 line_range_end=157 path=README.md git_url="https://github.com/AcidicSoil/prompts/blob/main/README.md#L5-L157"}​- `WORKFLOW.md` – Detailed phase-by-phase breakdown (P0–P9) aligning prompts with goals, gates, owners, and missing pieces.​:codex-file-citation[codex-file-citation]{line_range_start=33 line_range_end=170 path=WORKFLOW.md git_url="https://github.com/AcidicSoil/prompts/blob/main/WORKFLOW.md#L33-L170"}​- `workflow.mmd` – Linear Mermaid source enumerating prompt execution order (currently a flat chain).​:codex-file-citation[codex-file-citation]{line_range_start=1 line_range_end=53 path=workflow.mmd git_url="https://github.com/AcidicSoil/prompts/blob/main/workflow.mmd#L1-L53"}​- Representative prompts (`planning-process.md`, `scope-control.md`, `scaffold-fullstack.md`, `integration-test.md`, etc.) – Individual instructions without explicit stage cross-links.​:codex-file-citation[codex-file-citation]{line_range_start=1 line_range_end=35 path=planning-process.md git_url="https://github.com/AcidicSoil/prompts/blob/main/planning-process.md#L1-L35"}​​:codex-file-citation[codex-file-citation]{line_range_start=1 line_range_end=24 path=scope-control.md git_url="https://github.com/AcidicSoil/prompts/blob/main/scope-control.md#L1-L24"}​​:codex-file-citation[codex-file-citation]{line_range_start=1 line_range_end=42 path=scaffold-fullstack.md git_url="https://github.com/AcidicSoil/prompts/blob/main/scaffold-fullstack.md#L1-L42"}​​:codex-file-citation[codex-file-citation]{line_range_start=1 line_range_end=24 path=integration-test.md git_url="https://github.com/AcidicSoil/prompts/blob/main/integration-test.md#L1-L24"}​## Improvements ### 1. Core prompts lack stage hand-offs Individual prompt files describe local steps but do not tell operators which lifecycle phase they belong to or which prompt to trigger next (e.g., `planning-process`, `scope-control`, `scaffold-fullstack`, `integration-test`, `regression-guard`, `release-notes`). This forces contributors to juggle `WORKFLOW.md` manually instead of getting actionable “previous/next/gate” hints inside the prompts themselves.​:codex-file-citation[codex-file-citation]{line_range_start=9 line_range_end=35 path=planning-process.md git_url="https://github.com/AcidicSoil/prompts/blob/main/planning-process.md#L9-L35"}​​:codex-file-citation[codex-file-citation]{line_range_start=9 line_range_end=24 path=scope-control.md git_url="https://github.com/AcidicSoil/prompts/blob/main/scope-control.md#L9-L24"}​​:codex-file-citation[codex-file-citation]{line_range_start=7 line_range_end=29 path=scaffold-fullstack.md git_url="https://github.com/AcidicSoil/prompts/blob/main/scaffold-fullstack.md#L7-L29"}​​:codex-file-citation[codex-file-citation]{line_range_start=9 line_range_end=24 path=integration-test.md git_url="https://github.com/AcidicSoil/prompts/blob/main/integration-test.md#L9-L24"}​​:codex-file-citation[codex-file-citation]{line_range_start=9 line_range_end=19 path=regression-guard.md git_url="https://github.com/AcidicSoil/prompts/blob/main/regression-guard.md#L9-L19"}​​:codex-file-citation[codex-file-citation]{line_range_start=3 line_range_end=22 path=release-notes.md git_url="https://github.com/AcidicSoil/prompts/blob/main/release-notes.md#L3-L22"}​:::task-stub{title="Add stage navigation hints to core prompts"} 1. Use `WORKFLOW.md` (sections P1–P8) to map each direct slash prompt to its lifecycle phase and adjacent commands.​:codex-file-citation[codex-file-citation]{line_range_start=45 line_range_end=121 path=WORKFLOW.md git_url="https://github.com/AcidicSoil/prompts/blob/main/WORKFLOW.md#L45-L121"}​2. In each root prompt (`planning-process.md`, `scope-control.md`, `stack-evaluation.md`, `scaffold-fullstack.md`, `db-bootstrap.md`, `integration-test.md`, `coverage-guide.md`, `regression-guard.md`, `version-control-guide.md`, `devops-automation.md`, `review.md`, `release-notes.md`, `monitoring-setup.md`, `error-analysis.md`, etc.), append a `## Stage alignment` block that lists: - Phase name (e.g., “P1 Plan & Scope”), - Required gate/checklist, - Recommended previous and next prompts (with slash command names). 3. Where multiple prompts share a phase, cross-link them in bullet form (e.g., `/scope-control` → “Next: `/stack-evaluation` then `/scaffold-fullstack`”). 4. Keep lines ≤100 chars and reuse existing Markdown style guidelines from `docs/AGENTS.md` when editing.​:codex-file-citation[codex-file-citation]{line_range_start=5 line_range_end=31 path=docs/AGENTS.md git_url="https://github.com/AcidicSoil/prompts/blob/main/docs/AGENTS.md#L5-L31"}​::: ### 2. README index doesn’t expose lifecycle staging The README’s “Core slash commands” table is alphabetical without lifecycle context, while stage details live separately in `WORKFLOW.md`’s phase sections. This makes it harder for users to find the right prompt for a given development stage from the main entry point.​:codex-file-citation[codex-file-citation]{line_range_start=17 line_range_end=104 path=README.md git_url="https://github.com/AcidicSoil/prompts/blob/main/README.md#L17-L104"}​​:codex-file-citation[codex-file-citation]{line_range_start=45 line_range_end=170 path=WORKFLOW.md git_url="https://github.com/AcidicSoil/prompts/blob/main/WORKFLOW.md#L45-L170"}​:::task-stub{title="Expose dev-cycle stages in README prompt index"} 1. Rework the “Core slash commands” section in `README.md` to either: - Add a “Stage” column referencing `WORKFLOW.md` phase IDs (P0–P8), or - Split the table into subsections per phase with brief gate summaries. 2. Link each stage label back to the relevant heading in `WORKFLOW.md` for deeper context. 3. Ensure the updated table still lists command triggers and short descriptions, preserving the current installation guidance. 4. Run `markdownlint` locally (per `docs/AGENTS.md`) to confirm the table formatting remains valid. ::: ### 3. workflow.mmd is a flat chain instead of stage clusters `workflow.mmd` enumerates every prompt in one long path, without grouping nodes by lifecycle phase or highlighting gate loops. This misrepresents the structured phase model that `WORKFLOW.md` defines and makes the visualization hard to follow during execution.​:codex-file-citation[codex-file-citation]{line_range_start=1 line_range_end=53 path=workflow.mmd git_url="https://github.com/AcidicSoil/prompts/blob/main/workflow.mmd#L1-L53"}​​:codex-file-citation[codex-file-citation]{line_range_start=45 line_range_end=170 path=WORKFLOW.md git_url="https://github.com/AcidicSoil/prompts/blob/main/WORKFLOW.md#L45-L170"}​:::task-stub{title="Reshape workflow.mmd into gated lifecycle subgraphs"} 1. Translate the phase structure in `WORKFLOW.md` (P0–P9) into Mermaid subgraphs, grouping prompts under each stage with gate nodes (Scope/Test/Review/Release). 2. Reorder edges in `workflow.mmd` so transitions match the phase order (e.g., all P2 prompts inside one cluster before moving to P3). 3. Add cross-cutting branches (e.g., model tactics) as side subgraphs referencing the main flow. 4. Keep the diagram compatible with the Mermaid snippet embedded in `README.md` and update that snippet if needed to stay in sync. ::: ## Limitations Findings come from static Markdown inspection; verifying how Codex actually sequences prompts or enforces gates would require running the CLI, which wasn’t possible here




## Answer

The Codex system supports custom commands through a **custom prompts** feature that allows you to create reusable prompts stored in a prompts directory. [1](#0-0)  These custom prompts appear alongside built-in slash commands in the TUI's command popup when you type `/`. [2](#0-1)

### How Custom Prompts Work

Custom prompts are discovered from a default prompts directory and integrated into the slash command system. [3](#0-2)  The system uses the `CustomPrompt` type which contains a name, file path, and content. [4](#0-3)

In the TUI, when you type `/` followed by text, the command popup shows both built-in commands and your custom prompts. [5](#0-4)  Custom prompts are filtered out if they have the same name as built-in commands to avoid conflicts. [6](#0-5)

### Implementation Details

The custom prompts are loaded via `Op::ListCustomPrompts` operation, which triggers discovery of prompts in the default directory. [1](#0-0)  The discovered prompts are then sent to the UI components via a `ListCustomPromptsResponseEvent`. [7](#0-6)

In the command popup, custom prompts appear with the description "send saved prompt" and are formatted as `/{prompt_name}`. [8](#0-7)

### Creating Custom Commands

To add a custom command like "generate commit message", you would:

1. Create a markdown file in the prompts directory (the exact location is determined by `crate::custom_prompts::default_prompts_dir()`)
2. Name the file appropriately (e.g., `commit-message.md`)
3. The file name becomes the command name, so `/commit-message` would trigger your prompt
4. The file content becomes the prompt text sent to the AI

## Notes

The system automatically excludes custom prompts that have names conflicting with built-in slash commands to prevent confusion. [9](#0-8)  The prompts are sorted alphabetically in the popup for consistent presentation. [10](#0-9)

Wiki pages you might want to explore:

- [Architecture Overview (openai/codex)](/wiki/openai/codex#1.1)

### Citations

**File:** codex-rs/core/src/codex.rs (L1427-1443)

```rust
            Op::ListCustomPrompts => {
                let sub_id = sub.id.clone();

                let custom_prompts: Vec<CustomPrompt> =
                    if let Some(dir) = crate::custom_prompts::default_prompts_dir() {
                        crate::custom_prompts::discover_prompts_in(&dir).await
                    } else {
                        Vec::new()
                    };

                let event = Event {
                    id: sub_id,
                    msg: EventMsg::ListCustomPromptsResponse(ListCustomPromptsResponseEvent {
                        custom_prompts,
                    }),
                };
                sess.send_event(event).await;
```

**File:** codex-rs/tui/src/bottom_pane/command_popup.rs (L12-12)

```rust
use codex_protocol::custom_prompts::CustomPrompt;
```

**File:** codex-rs/tui/src/bottom_pane/command_popup.rs (L15-21)

```rust
/// A selectable item in the popup: either a built-in command or a user prompt.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum CommandItem {
    Builtin(SlashCommand),
    // Index into `prompts`
    UserPrompt(usize),
}
```

**File:** codex-rs/tui/src/bottom_pane/command_popup.rs (L33-36)

```rust
        // Exclude prompts that collide with builtin command names and sort by name.
        let exclude: HashSet<String> = builtins.iter().map(|(n, _)| (*n).to_string()).collect();
        prompts.retain(|p| !exclude.contains(&p.name));
        prompts.sort_by(|a, b| a.name.cmp(&b.name));
```

**File:** codex-rs/tui/src/bottom_pane/command_popup.rs (L51-53)

```rust
        prompts.retain(|p| !exclude.contains(&p.name));
        prompts.sort_by(|a, b| a.name.cmp(&b.name));
        self.prompts = prompts;
```

**File:** codex-rs/tui/src/bottom_pane/command_popup.rs (L104-143)

```rust
    fn filtered(&self) -> Vec<(CommandItem, Option<Vec<usize>>, i32)> {
        let filter = self.command_filter.trim();
        let mut out: Vec<(CommandItem, Option<Vec<usize>>, i32)> = Vec::new();
        if filter.is_empty() {
            // Built-ins first, in presentation order.
            for (_, cmd) in self.builtins.iter() {
                out.push((CommandItem::Builtin(*cmd), None, 0));
            }
            // Then prompts, already sorted by name.
            for idx in 0..self.prompts.len() {
                out.push((CommandItem::UserPrompt(idx), None, 0));
            }
            return out;
        }

        for (_, cmd) in self.builtins.iter() {
            if let Some((indices, score)) = fuzzy_match(cmd.command(), filter) {
                out.push((CommandItem::Builtin(*cmd), Some(indices), score));
            }
        }
        for (idx, p) in self.prompts.iter().enumerate() {
            if let Some((indices, score)) = fuzzy_match(&p.name, filter) {
                out.push((CommandItem::UserPrompt(idx), Some(indices), score));
            }
        }
        // When filtering, sort by ascending score and then by name for stability.
        out.sort_by(|a, b| {
            a.2.cmp(&b.2).then_with(|| {
                let an = match a.0 {
                    CommandItem::Builtin(c) => c.command(),
                    CommandItem::UserPrompt(i) => &self.prompts[i].name,
                };
                let bn = match b.0 {
                    CommandItem::Builtin(c) => c.command(),
                    CommandItem::UserPrompt(i) => &self.prompts[i].name,
                };
                an.cmp(bn)
            })
        });
        out
```

**File:** codex-rs/tui/src/bottom_pane/command_popup.rs (L189-194)

```rust
                    CommandItem::UserPrompt(i) => GenericDisplayRow {
                        name: format!("/{}", self.prompts[i].name),
                        match_indices: indices.map(|v| v.into_iter().map(|i| i + 1).collect()),
                        is_current: false,
                        description: Some("send saved prompt".to_string()),
                    },
```

**File:** codex-rs/tui/src/bottom_pane/command_popup.rs (L291-307)

```rust
    fn prompt_name_collision_with_builtin_is_ignored() {
        // Create a prompt named like a builtin (e.g. "init").
        let popup = CommandPopup::new(vec![CustomPrompt {
            name: "init".to_string(),
            path: "/tmp/init.md".to_string().into(),
            content: "should be ignored".to_string(),
        }]);
        let items = popup.filtered_items();
        let has_collision_prompt = items.into_iter().any(|it| match it {
            CommandItem::UserPrompt(i) => popup.prompt_name(i) == Some("init"),
            _ => false,
        });
        assert!(
            !has_collision_prompt,
            "prompt with builtin name should be ignored"
        );
    }
```

**File:** codex-rs/tui/src/chatwidget.rs (L1422-1427)

```rust
    fn on_list_custom_prompts(&mut self, ev: ListCustomPromptsResponseEvent) {
        let len = ev.custom_prompts.len();
        debug!("received {len} custom prompts");
        // Forward to bottom pane so the slash popup can show them now.
        self.bottom_pane.set_custom_prompts(ev.custom_prompts);
    }
```

# 1
## Add stage alignment sections to prompts



1. In each core slash prompt under the repo root (`planning-process.md`, `scope-control.md`, `stack-evaluation.md`, `scaffold-fullstack.md`, `db-bootstrap.md`, `integration-test.md`, `coverage-guide.md`, `regression-guard.md`, `version-control-guide.md`, `devops-automation.md`, `review.md`, `release-notes.md`, `monitoring-setup.md`, `error-analysis.md`, etc.), append a `## Stage alignment` section that lists:

   - The corresponding phase from `WORKFLOW.md` (e.g., “P1 Plan & Scope”),
   - The gate/checkpoint required to exit the stage,
   - Suggested previous and next slash commands (e.g., “Previous: `/planning-process` • Next: `/stack-evaluation`”).
2. Cross-link sibling prompts within the same phase when multiple options exist (bulleted list is fine).
3. Keep Markdown line length within 80–100 characters per `docs/AGENTS.md`, and ensure headings stay consistent with existing style.




+28
-28

# 2
## Update README.md core slash commands

1. Update the “Core slash commands” section in `README.md` to expose lifecycle context—either add a “Stage” column pointing to the relevant `P#` phase or split the table into subsections per phase.
2. Link each stage label back to the matching heading in `WORKFLOW.md` so readers can drill into gate criteria.
3. Verify the revised Markdown passes `markdownlint` as recommended in `docs/AGENTS.md`.



# 3
+231 -101
# Refactor workflow.mmd with Mermaid subgraphs


1. Rewrite `workflow.mmd` using Mermaid subgraphs that group prompts per phase (P0–P9) and include explicit gate nodes (Scope/Test/Review/Release).
2. Ensure transitions between subgraphs mirror the phase order in `WORKFLOW.md`, adding branches for cross-cutting prompts where applicable.
3. Update the Mermaid snippet embedded in `README.md` to stay consistent with the new diagram.


- 2000

# 4
## Introduce metadata and generator script

1. Introduce lightweight metadata (front matter or a `Stage:`/`Gate:` block) to each root-level prompt Markdown so stage, gate, and next/previous commands are machine-readable; keep fields consistent across files.
2. Add a generator script (e.g., `scripts/update_catalog.ts`) that scans prompts for `Trigger:` plus the new stage metadata, then rebuilds:

   - the README “Core slash commands” table grouped by stage,
   - a lifecycle summary (JSON/YAML) consumed by `WORKFLOW.md`,
   - `workflow.mmd` (Mermaid) with phase subgraphs.
3. Provide a CLI (e.g., `pnpm update:catalog`) and document it in `README.md`, asking contributors to run it after creating or editing prompts.
4. Validate the regenerated Markdown with `npx markdownlint-cli2 "**/*.md"` and commit the script, metadata changes, and regenerated docs.
