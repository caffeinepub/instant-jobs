# Specification

## Summary
**Goal:** Replace Internet Identity with in-app manual credential authentication (Jobseeker/Employer/Admin), add JobHai-style employer credits + candidate unlock system, and deliver an Admin Panel with full platform controls under a new colorful “Instant Jobs” mobile-first theme.

**Planned changes:**
- Remove Internet Identity UI/copy and switch to manual credential auth with role-based sessions, route protection, logout-required role switching, and session/cache clearing on logout.
- Implement backend auth with salted password hashing, server-generated session tokens, token validation on protected methods, logout/token invalidation, and session introspection.
- Extend backend profiles for jobseekers and employers with the specified Indian job portal fields and allow profile editing; ensure salary is treated/displayed as ₹.
- Add backend employer credit balance + admin-managed credit cost per unlock, candidate unlock API (idempotent, atomic deduction), and unlock logs for admin audit.
- Update backend candidate directory to return limited fields pre-unlock and full fields post-unlock, with server-side filters (location, salary, experience, process/role) and excluding inactive jobseekers.
- Build an Admin Panel UI (/admin) for managing employers/jobseekers (enable/disable), adjusting credits, setting unlock cost, viewing unlock logs, optionally approving/rejecting jobs, and viewing metrics (totals, credits used, active jobs).
- Update employer UI to show credit balance, locked/unlocked candidate cards, unlock confirmation + success/error states (including insufficient credits), and permanent unlock visibility across sessions.
- Update job browsing/posting UI to be mobile-first and card-based, with fast filters (location, salary, experience, process) and ₹-only salary display across the app.
- Apply a fully custom, colorful, mobile-first theme with distinct styling for jobseeker vs employer vs admin sections, keeping “Instant Jobs” branding and avoiding any Internet Identity visuals/copy.
- Add data migration only if needed to preserve existing canister state across schema/auth changes without trapping.

**User-visible outcome:** Users can sign up/log in with manual credentials by role (jobseeker/employer/admin) and only see pages allowed for their role; employers can browse candidates with locked details, use admin-managed credits to unlock full profiles, and see their credit balance; admins can manage accounts, credits, unlock settings/logs, and platform metrics via a dedicated admin panel; the app uses a new colorful, mobile-first UI with ₹-only salary displays and fast filters.
