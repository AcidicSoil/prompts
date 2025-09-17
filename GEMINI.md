# GEMINI.md

## Directory Overview

This directory contains a collection of prompts for the Codex CLI, designed to streamline and enhance various software development workflows. The prompts are written in Markdown and act as templates or scripts that can be invoked from the Codex command line. They cover a wide range of tasks, from planning and architecture to code generation, review, and auditing.

The prompts are categorized into two main types:

- **Slash Commands:** These are standalone prompts that can be directly invoked using a slash command (e.g., `/planning-process`). They are identified by a `Trigger:` line in the Markdown file.
- **Gemini→Codex Mapper Templates:** These prompts are designed to be used with the `/gemini-map` command. They are identified by a YAML front-matter block at the beginning of the file.

## Key Files

- **`README.md`**: The main documentation for the prompt collection. It provides an overview of the available prompts, their purpose, and how to use them.
- **`AGENTS.md`**: Contains guidelines for contributors, including information on project structure, coding style, testing, and commit conventions.
- **`workflow.mmd`**: A Mermaid flowchart that visualizes the end-to-end workflow of using the prompts.
- **`.markdownlint.json`**: The configuration file for the Markdown linter, which enforces a consistent style for all prompt files.
- **`codefetch/`**: A directory containing reference snippets and other assets used by the prompts.
- **Prompt Files (`.md`)**: The individual prompt files, each of which corresponds to a specific command or template.

## Usage

The prompts in this directory are intended to be used with the Codex CLI. To use them, you can either invoke the slash commands directly or use the `/gemini-map` command with a template file.

**Slash Commands:**

To use a slash command, simply type the command into the Codex CLI. For example, to use the planning process prompt, you would type:

```
/planning-process Add a new feature
```

**Gemini→Codex Mapper Templates:**

To use a `gemini-map` template, you would use the `/gemini-map` command followed by the name of the template file. For example, to use the `audit.md` template, you would type:

```
/gemini-map audit
```

**Validation:**

To ensure that the prompt files are well-formed and adhere to the project's style guidelines, you can use the following command to run the Markdown linter:

```
npx markdownlint-cli2 "**/*.md"
```
