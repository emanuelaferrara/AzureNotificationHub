---
status: accepted
---

# Desktop client provisions [ANH] relay subscriptions with a hardcoded write-PAT

At startup the desktop app ensures the Gmail relay address has an Azure DevOps
subscription for every subscription template (plus a hand-added mention
subscription), so the backend's inbox watcher receives a copy of every relevant
notification. We create **new** custom-address ("relay") subscriptions marked
`[ANH]` alongside the user's existing ones rather than changing the subscriber's
preferred email — because notifications must still reach the user's real address
*as well as* the relay. Provisioning lives in the desktop client (not the
backend) because the desktop app is the intended owner of subscription
management, and the Azure DevOps PAT is, for now, a hardcoded constant behind a
single accessor.

## Considered Options

- **Set the subscriber's preferred email to the relay address.** Rejected:
  redirects *all* notifications to the relay and away from the user's real
  inbox; we need delivery to both.
- **Provision from the backend** (which already holds secrets in `.env` and
  watches the inbox). Rejected by product decision: the desktop app is meant to
  own subscription management, with a future in-app screen for the user to
  supply their own PAT.

## Consequences

- A **write-scoped** PAT ships inside the desktop bundle in plaintext. This is a
  known secret-hygiene compromise, accepted temporarily; the planned PAT-entry
  UI (backed by macOS Keychain) is the intended fix. The token is isolated
  behind a single accessor to make that swap small.
- Events matched by both a default subscription and an `[ANH]` relay
  subscription produce **two** emails. Intended.
- `team` subscription templates with placeholder filters are skipped; the
  mention event has no template and is added by hand.
