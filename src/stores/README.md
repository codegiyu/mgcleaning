# Client state and cache

Use Zustand for state shared across routes or for feature data that needs a
client-side cache. Keep form drafts and other short-lived UI state local to the
component. Feature stores should call `callApi` and define their own refresh,
expiry, and invalidation rules once the relevant screen and API contract exist.

React Query is intentionally not part of this app.
