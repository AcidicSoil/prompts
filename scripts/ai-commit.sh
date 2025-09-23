#!/usr/bin/env bash
set -euo pipefail

added_files=$(git diff --cached --name-only)
[ -z "$added_files" ] && { echo "No staged changes."; exit 1; }

echo "Staged files:"; echo "$added_files"

msg="$(git diff --cached | gemini --model gemini-2.5-flash --prompt 'Generate a concise Conventional Commit (type(scope): summary).')"
[ -z "$msg" ] && { echo "Empty message."; exit 1; }

git commit -m "$msg"
