#!/usr/bin/env bash
# One-time repo setup: pipeline labels and the master ruleset; safe to re-run
set -euo pipefail

gh label create idea        --force --color FBCA04 --description "Agent grills the idea in comments"
gh label create grilled     --force --color C2E0C6 --description "Idea is clear; agent splits it into tickets"
gh label create backlog     --force --color 1D76DB --description "Ticket is ready; agent implements it and opens a PR"
gh label create reviewed    --force --color 5319E7 --description "Agent reviewed the PR; agent applies the fixes"
gh label create done        --force --color 0E8A16 --description "Agents are done; ready for human QA on the preview"
gh label create needs-human --force --color B60205 --description "An agent stopped and needs a person"

# master changes only through a squash-merged PR with one approval and a green `check` job (pr.yml).
# Repo admins (role id 5) may bypass it inside a PR, to merge their own; agents can't.
ruleset=$(cat <<'EOF'
{
  "name": "master",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "pull_request" }],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [{ "context": "check" }]
      }
    }
  ]
}
EOF
)

id=$(gh api "repos/{owner}/{repo}/rulesets" --jq '.[] | select(.name == "master") | .id')
if [ -n "$id" ]; then
  gh api --method PUT "repos/{owner}/{repo}/rulesets/$id" --input - <<< "$ruleset" > /dev/null
else
  gh api --method POST "repos/{owner}/{repo}/rulesets" --input - <<< "$ruleset" > /dev/null
fi
echo "Labels and the master ruleset are set up."
