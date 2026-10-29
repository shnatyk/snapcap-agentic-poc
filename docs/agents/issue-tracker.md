# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body-file <file>`. Write multi-line bodies to a file first.
- **Read an issue**: `gh issue view <number> --comments`, plus `--json labels` when labels matter.
- **List issues**: `gh issue list --state open --json number,title,labels` with `--label` / `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body-file <file>`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically inside the clone.

## Parent and child tickets

- **Child ticket**: link it to its parent as a GitHub sub-issue: `gh api --method POST repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`. The database id comes from `gh api repos/{owner}/{repo}/issues/<child> --jq .id` (not the `#number`). Also put `Parent: #<parent>` at the top of the child body.
- **Blocking**: put `Blocked by: #<n>, #<n>` in the child body. A ticket is unblocked when every blocker is closed.

## Pull requests as a triage surface

**PRs as a request surface: no.**

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>`. Inline review comments: `gh api repos/{owner}/{repo}/pulls/<number>/comments`.
- **Comment / label**: `gh pr comment`, `gh pr edit --add-label` / `--remove-label`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.
