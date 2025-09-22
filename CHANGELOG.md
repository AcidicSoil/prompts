# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning when applicable.

## [Unreleased]
### Added

- Add new `@prompts/tools` package to expose core task management logic
- Implement a stateful workflow engine with a dedicated CLI and MCP server
- Introduce structured research and planning workflow with new prompt tools
- Add a comprehensive CLI and MCP server guide
- Introduce Task-Master CLI and MCP server
- Implement Task-Master ingest adapter with schema validation and status normalization
- Implement Jest testing framework and define a canonical JSON schema for tasks
- Rebaseline project with a new Product Requirements Document (PRDv2) for Task-Master interoperability
- Introduce Task-Master state engine and a suite of `/tm-*` slash commands
- Add `/plan-delta` prompt for mid-project planning changes
- Prepare for initial npm publish by updating `package.json` and adding a release runbook
- Complete and verify the CLI distribution workflow
- Introduce `prompts` CLI for workflow management
- Add `/docfetch-check` prompt to enforce documentation freshness
- Implement a graph-based workflow planner and state management engine
- Dynamically register prompts from YAML as executable MCP tools
- Implement a robust `StateStore` for managing project state
- Implement a dynamic, stateful prompt workflow and automation engine
- Initialize project tasks from a Product Requirements Document (PRD)
- Add initial Product Requirements Document (PRD) for the prompt pack
- Add research report for building a proactive workflow assistant
- Automate README table generation from the prompt catalog
- Add a script to build the prompt catalog
- Add trigger and purpose metadata to prompts
- Add a guide for converting prompt libraries into MCP servers
- Introduce the MCP workflow assistant concept
- Add lifecycle metadata front matter to prompts and a validator script
- Implement a dynamic router for documentation MCP servers
- Add a future enhancements roadmap
- Add `/prd-generate` prompt to create a PRD from a README
- Introduce a self-contained MCP server for managing and serving prompts
- Add `/pr-desc` prompt for generating pull request descriptions
- Integrate Task Master AI for managing agentic workflows
- Implement a structured instruction and execution framework for the agent
- Add a comprehensive set of prompts for building an application from scratch
- Introduce a comprehensive end-to-end development workflow guide
- Define an end-to-end application development workflow document
- Add full reference implementation documentation for a Prompts MCP server
- Add `GEMINI.md` and `AGENTS.md` for project context

### Changed

- Centralize state management into a new `TaskService`
- Implement batched memory updates for the agent, synchronized with Task Master status
- Update README with usage examples and server launch instructions
- Update `AGENTS.md` with Task Master integration guides
- Formalize PRD in Markdown and refactor research log
- Implement a more efficient batched memory update system for the agent
- Improve prompt metadata validation with `zod` and `glob`
- Automate workflow phase synchronization
- Describe catalog maintenance workflow in documentation
- Align `generate` prompt with unit test workflow
- Clarify commit assistant workflow in documentation
- Update README to clarify `/gemini-map` usage
- Update `/audit` prompt for direct slash command usage
- Align prompts with the gated lifecycle workflow
- Refactor agent's instructional context and planning artifacts with a formal PRD
- Overhaul and categorize the prompt catalog in the README

### Deprecated

- Deprecate previous prompt-authoring workstream as part of PRDv2 rebaseline

### Removed

- Remove the automated documentation maintenance flow in favor of a dynamic router
- Remove obsolete workflow and PRD documentation
- Remove duplicate `/pr-desc` prompt
- Delete old `PRD-v2.txt` file

### Fixed

- Consolidate and fix the test suite to run via Jest
- Correct test limit for multi-byte character truncation
- Improve payload capping logic for UTF-8 character boundaries and edge cases
- Correct Mermaid syntax in workflow diagrams

### Security

- Placeholder for upcoming changes.

## [0.1.0] - 2025-09-22
### Added

- MCP/acidic_soil_prompts_integration_rollup_2025_09_21_america_chicago.md
- cross-check.md
- evidence-capture.md
- query-set.md
- research-batch.md
- research-item.md
- roll-up.md

<!--
Maintenance notes:
- When merging changes, add entries under Added/Changed/Deprecated/Removed/Fixed/Security.
- Prefer concise, user-facing descriptions over commit-level details.
- Optionally link PR numbers or commit hashes if helpful.
-->