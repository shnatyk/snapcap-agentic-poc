# snapcap-agentic-poc

A to-do list web app, used as a proof of concept for a label-driven agent pipeline on GitHub. Each label starts one agent in GitHub Actions ([`claude-code-action`](https://github.com/anthropics/claude-code-action)). The agent runs one of [Matt Pocock's skills](https://github.com/mattpocock/skills), then sets the label that starts the next agent. People step in at three points: answering the grill, testing the preview, and approving the PR.

## The flow

| Trigger                        | Set by | Workflow               | What happens                                                                                                             | Ends with                          |
| ------------------------------ | ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `idea` on an issue             | human  | `agent-grill.yml`      | `/grill-with-docs`: one round of questions per run. Each human comment starts the next round. Ends with a `## Summary`.  | `grilled`, after you reply "ok"    |
| `grilled` on an issue          | agent  | `agent-tickets.yml`    | `/to-tickets`, minimal: one ticket unless the work clearly splits. Tickets are sub-issues of the idea.                   | `backlog` on each unblocked ticket |
| `backlog` on an issue          | agent  | `agent-implement.yml`  | `/implement` (with `/tdd`) on a new branch, then opens a PR with `Closes #N`. Skips if that PR is already open.          | PR opened                          |
| PR opened by `claude[bot]`     | agent  | `agent-review.yml`     | `/code-review` against `master`, posted as one PR comment.                                                               | `reviewed`                         |
| `reviewed` on a PR             | agent  | `agent-review-fix.yml` | Picks the findings worth fixing (minimal, low defensive coding), pushes, lists fixed and skipped. Requests your review.  | `done`                             |
| `done` on a PR                 | agent  | none                   | **Your turn:** you get a review request. Open the preview link from the PR comment and test.                             |                                    |
| Review: **Request changes**    | human  | `agent-qa-fix.yml`     | Applies the review and its inline comments, pushes, requests your review again.                                          | `done`                             |
| Review: **Approve**            | human  | `merge.yml`            | Waits for any running agent, needs `done`, squash-merges, deploys, removes the preview. If it can't, it comments why.    | merged                             |
| push to `master`               |        | `deploy.yml`           | Builds and publishes to GitHub Pages.                                                                                    |                                    |

`pr.yml` runs typecheck, tests and build (the `check` job) on every PR push, and keeps a preview at `<pages-url>/pr-preview/pr-<number>/`.

The **owner** of a piece of work is the author of the original idea issue (for a ticket with no parent: the ticket's author). The owner gets the review requests and the `needs-human` pings.

The agent stages only run on PRs opened by `claude[bot]`. Your own PRs get the normal human review.

You can skip a stage by adding its label by hand: for example, open an issue that is already a clear ticket and label it `backlog`.

## When an agent gets stuck

Every agent job checks its own end state: the expected label, the PR, or the tickets. If the run failed, or ended without that state, the job adds `needs-human` and comments with an `@owner` mention and a link to the run. An agent that can't finish without a person (a contradictory ticket, tests it can't fix) does the same itself, saying what it needs.

To retry, fix the cause and click **Re-run jobs** on the failed run. For the grill stage, a new comment works too. Each run clears `needs-human` when it starts.

## Setup (once)

1. Create a **public** GitHub repo and push this folder to it. On a free plan, GitHub Pages and rulesets work only on public repos (see [Public repo](#public-repo-who-can-do-what)).
2. Install the **Claude GitHub App** on that repo: <https://github.com/apps/claude>. Agents act through its token, and that is what lets one agent's label or PR start the next workflow (see below).
3. Add the repo secret `ANTHROPIC_API_KEY`: an API key from the Claude Console. Usage is billed per token, so set a monthly spend limit on its workspace in the Console.
4. Run `./scripts/setup-repo.sh`. It creates the labels and a ruleset on `master`: changes only through a squash-merged PR with one approval and a green `check`. Repo admins may bypass it inside a PR, to merge their own; agents can't.
5. Wait for the first `Deploy` run (it creates the `gh-pages` branch). Then in Settings → Pages, choose "Deploy from a branch", `gh-pages`, `/ (root)`.

Optional: set the repo variable `CLAUDE_MODEL` to change the model (default `sonnet`).

## Public repo: who can do what

- **Anyone** can see the code, issues, PRs, comments, Actions logs and the Pages site. They can comment, open issues and open PRs from a fork. They can't push, merge, add labels or change settings.
- **Only collaborators start agents.** Labels need write or triage access. Comments and reviews start an agent only when their author is the owner or a collaborator. `claude-code-action` also checks write access before calling Claude.
- **Secrets stay secret.** `ANTHROPIC_API_KEY` is never shown in the UI, is masked in logs, and isn't given to fork PRs. The agent's shell doesn't get it either: `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` strips it and keeps only the GitHub token.
- **Strangers' comments** can still end up in a thread an agent reads. `AGENTS.md` tells agents to ignore comments from non-collaborators. That's a prompt rule, not a hard block. To block it fully, set Settings → Moderation → Interaction limits to "collaborators only" (max 6 months at a time). Untested here: if `claude[bot]` comments start failing, turn it off.
- **Actions minutes** are free on public repos.

## Try it

Open an issue such as "Let me edit a to-do's title" and give it the `idea` label. Answer the agent's questions in comments. When it posts a `## Summary`, reply "ok". From there it runs on its own until you get a review request. Test the preview, then **Approve** or **Request changes** in the PR's review.

## How it fits together

- **Why the Claude GitHub App.** Events made with a workflow's own `GITHUB_TOKEN` start no other workflows; GitHub blocks that to prevent loops. Events made with a GitHub App token do start them. The agents label and open PRs as `claude[bot]`, so the chain keeps going.
- **`allowed_bots: claude`.** `claude-code-action` refuses bot actors by default. Every workflow that an agent starts allows `claude[bot]` explicitly.
- **No comment loop.** The grill workflow only reacts to comments by humans (`user.type == 'User'`), so the agent's own comments don't restart it.
- **Prompts start with `/<skill>`.** In headless mode Claude Code loads the skill and appends the rest of the prompt as `ARGUMENTS`. Stage rules (what to read, which label to set) live in the workflow prompt. Shared rules live in `AGENTS.md` and `docs/agents/`.
- **One agent per item at a time.** All agent jobs and the merge share the concurrency group `agent-<number>`, so they queue instead of overlapping.
- **The human gate is enforced, not just agreed.** The ruleset means no agent can push to `master` or merge without a human approval. A push after an approval dismisses it.
- **Merge uses `GITHUB_TOKEN`**, so its push to `master` starts nothing on its own. `merge.yml` calls `deploy.yml` and removes the preview itself.
- **Skipped runs are deleted.** `on:` can't filter by label or comment author, so every event starts each agent workflow listening for it, and most end skipped. After each agent job (and the merge), `prune-skipped-runs.yml` deletes the runs where nothing ran.
- **Who can start agents.** Comment and review triggers filter on `author_association`, and `claude-code-action` checks write access again.

## Known gaps

- Plain PR comments start nothing. QA feedback has to go in a review with **Request changes**.
- Blocked tickets get no `backlog` label. Add it yourself once the blocker is merged.
- Tickets implemented in parallel can conflict at merge. The merge workflow comments, and someone resolves it. PRs don't need to be up to date with `master`, so a clean merge can still break it.
- The parent idea issue is not closed automatically.
- Agents can't edit `.github/workflows/`: the Claude GitHub App has no permission for workflow files.
- Job timeouts (20–45 min) are the only cost guard.
- Agents have full shell access in the runner, and collaborators' issue and comment text goes straight into their context. Keep the collaborator list short.
- The admin bypass uses repository role id `5`. If Settings → Rules shows a different role, fix it there.

## App

Vite + TypeScript, no framework. State lives in `localStorage`. Node version is in `.nvmrc`.

```bash
npm install
npm run dev
npm test
```
