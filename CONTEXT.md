# Context

Glossary of the project's ubiquitous language. Terms only — no implementation
details.

## Notifications & subscriptions

- **Relay address** — the Gmail address the backend watches over IMAP
  (`imap.gmail.com`). All Azure DevOps notifications we want the app to see must
  be delivered here. Currently `marcodanielenotificationrelay@gmail.com`.

- **Relay subscription** — an Azure DevOps notification subscription created and
  owned by this app whose delivery channel points at the [[relay-address]]
  (a custom-address email channel) rather than the user's default email. Its
  purpose is to duplicate a notification into the relay inbox. Identified by the
  **[ANH] marker** in its description.

- **[ANH] marker** — the `[ANH] ` prefix on a subscription's description that
  identifies it as an app-managed [[relay-subscription]]. Subscriptions without
  this marker are never touched by the app.

- **Default subscription** — a pre-existing subscription that delivers to the
  subscriber's preferred email address (`useCustomAddress: false`). These are
  the user's own / out-of-the-box subscriptions. The app never creates,
  modifies, or deletes these; relay subscriptions exist *alongside* them, so an
  event matched by both produces two emails (one to the default address, one to
  the relay address) — this duplication is intended.

- **Subscription template** — Azure DevOps's own catalogue entry describing a
  subscribable situation: an event type plus a default filter. The list a user
  would pick from when adding a new subscription in the ADO web UI. The app
  treats the template catalogue as the definition of "every possible
  subscription".

- **Provisioning** — the act, run at desktop-app startup, of ensuring exactly
  one [[relay-subscription]] exists for each item in the target set (all `both`
  and `user` templates, one `team` template, plus a hand-added mention
  subscription). Idempotent: only missing relay subscriptions are created;
  existing ones are left as-is.
