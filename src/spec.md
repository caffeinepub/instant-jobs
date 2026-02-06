# Specification

## Summary
**Goal:** Fix the Home/Landing initial-load crash caused by calling `useManualAuth` outside of `ManualAuthProvider`.

**Planned changes:**
- Wrap the application’s route tree with `<ManualAuthProvider>` in an editable entry point (e.g., `frontend/src/App.tsx`) so it covers `RootLayout`, `AppLayout`, `AppHeader`, and all routed pages.
- Ensure no changes are made to `frontend/src/main.tsx` while resolving the provider wiring issue.

**User-visible outcome:** Loading the app at `/` (and navigating to `/login`, `/admin`, and `/employer/candidates`) no longer shows the “useManualAuth must be used within ManualAuthProvider” error; the Landing page renders normally with header/footer visible.
