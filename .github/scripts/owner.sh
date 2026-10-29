#!/usr/bin/env bash
# Prints the human who owns an issue or PR: the author of the original idea
set -euo pipefail

# Set in Actions; in a local clone, gh knows the repo
: "${GITHUB_REPOSITORY:=$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"

number=$1

# A PR belongs to the ticket it closes
if [ "$(gh api "repos/$GITHUB_REPOSITORY/issues/$number" --jq '.pull_request != null')" = true ]; then
  number=$(gh pr view "$number" --repo "$GITHUB_REPOSITORY" --json closingIssuesReferences --jq '.closingIssuesReferences[0].number')
fi

# A ticket belongs to the author of its parent idea. On a 404, gh api prints the
# error body to stdout, so a failed lookup's output is thrown away, not kept.
login=$(gh api "repos/$GITHUB_REPOSITORY/issues/$number/parent" --jq .user.login 2>/dev/null) ||
  login=$(gh api "repos/$GITHUB_REPOSITORY/issues/$number" --jq .user.login)

case $login in
  *"[bot]") exit 1 ;;
  *) echo "$login" ;;
esac
