---
status: accepted
---

# Notification clicks are a generic package event; the app owns every consequence

The `react-native-mac-notifications` package surfaces a clicked notification as a
generic event carrying an **opaque payload** (the OS `userInfo` slot), buffered
across cold starts. It registers a `UNUserNotificationCenterDelegate`, adds a
new-architecture event emitter, and exposes `addNotificationResponseListener` +
`getInitialNotificationResponse()`. The package never inspects the payload and
knows nothing about "read", URLs, screens, pull requests, or categories.

The desktop **app** owns every consequence of a click. It attaches its own
notification `id` (and whatever else it wants) to the payload when posting, and
on click resolves the behaviour — the app's first [[click-action]] is *mark
read* — from the clicked notification's **own data** (does it carry a target
URL? is it actionable?), deliberately not from a category-to-action table.

## Considered Options

- **Stamp the click action onto each notification at creation (producer
  decides).** Rejected: couples the notification producer to app behaviour and
  bakes routing into data. We want routing that lives in app code and is changed
  by editing a resolver, not by re-shaping notification payloads.
- **A `category` → action table (in the package or the app).** Rejected:
  category routing was explicitly declined, and putting any domain vocabulary in
  the package would tailor it to this app and destroy its reusability. Behaviour
  is derived from a notification's *semantic* data instead.
- **Launch-only cold start (drop the click when the app was closed).** Rejected:
  clicking a notification while the app is closed must still run the task, and
  native buffering / an initial-response getter cannot be bolted on cheaply
  after the fact.

## Consequences

- The package takes on real native work: a delegate, a new-arch event emitter,
  buffering responses that arrive before JS attaches a listener, and
  `getInitialNotificationResponse()`. It lives in the reusable package, not the
  app.
- The app must maintain a real notification store keyed by `id` (replacing
  today's hardcoded mock list) so a click can find its notification to act on,
  and must place that `id` in the payload at post time — the WebSocket path in
  `App.tsx` currently drops everything but `title`/`body`.
- **App-side read state will not survive WebSocket reconnects/restarts**: the
  backend re-dumps every notification as `read: false` on each (re)connect, so
  read state needs persistence or read-sync to stick. Known limitation,
  deferred.
- Foreground notifications are presented (banner + sound) via `willPresent` — a
  generic default chosen for the package, not an app-specific behaviour.
- "Clicking opens a new window" is a **separate** native window-management
  concern (app activation / window reuse), fixed alongside this work but
  independent of the click pipeline.
