#!/usr/bin/env bash
# Prints the number of the open PR that closes the given issue, if there is one
set -euo pipefail

gh pr list --repo "$GITHUB_REPOSITORY" --state open --json number,closingIssuesReferences \
  --jq "[.[] | select(any(.closingIssuesReferences[]; .number == $1))][0].number // empty"
