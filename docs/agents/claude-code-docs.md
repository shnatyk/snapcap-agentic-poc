# Claude Code docs

How to find out how Claude Code and `claude-code-action` behave, reading only the lines you need.

## Claude Code

Every docs page has a Markdown version at `https://code.claude.com/docs/en/<page>.md`, and `https://code.claude.com/docs/llms.txt` lists the pages with one line each. Fetch with `curl -sSL`, `grep -n` for the term, and read only the lines around each hit. The pages run long (`env-vars.md` is about 190 KB), so a summary of a whole page tends to drop the one line you need.

```bash
curl -sSL https://code.claude.com/docs/en/env-vars.md | grep -n SUBPROCESS_ENV_SCRUB
```

The pages behind this repo's agent setup:

- `env-vars`: `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` and what the scrub removes
- `sandboxing`: protected paths, and strict sandbox mode, which the scrub turns on for Linux
- `github-actions`: Claude Code in GitHub Actions

## claude-code-action

Clone it shallowly into the scratchpad and grep it: `git clone --depth 1 https://github.com/anthropics/claude-code-action`. `action.yml` holds the inputs and the setup steps. `docs/security.md` and `docs/configuration.md` describe the behaviour.

## What the docs don't say

The action hides the agent's transcript, so check behaviour on the runner itself. Push a throwaway workflow on a `tmp/` branch, triggered on `push` to that branch. It should set up the job like the agent workflow, run `claude -p` with `--model haiku --output-format stream-json --verbose`, and print the tool results with `jq`. Delete the branch and the run afterwards.
