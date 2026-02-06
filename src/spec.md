# Specification

## Summary
**Goal:** Investigate and fix missing backend canister functions so the frontend actor API calls work again after the latest deployment.

**Planned changes:**
- Reproduce the “missing function” errors in the running app, capture exact console/runtime messages, and document the steps/pages/actions that trigger each issue.
- Compile a list of missing/broken canister methods (exact method names) and map them to their call sites in `frontend/src/hooks/useQueries.ts`.
- Restore parity between the frontend’s expected actor API and the backend canister’s exported Candid interface by ensuring all methods used in `useQueries.ts` exist and are callable (e.g., chooseRole, user profile, jobs, applications, and application status update methods).
- Add user-facing error handling for actor call failures so the UI shows clear English error messages (and remains usable) when a backend method is unavailable, specifically for job apply, employer job creation, and application status update actions.

**User-visible outcome:** Candidate and employer flows work end-to-end without “is not a function” / “method not found” errors, and any actor call failure shows a clear English message while the app remains navigable.
