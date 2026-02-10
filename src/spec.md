# Specification

## Summary
**Goal:** Resolve the post-signup infinite buffering and deliver a working Jobseeker Profile Setup flow (Fresher/Experienced with up to 5 experiences) using manual auth, including correct routing after profile completion.

**Planned changes:**
- Fix manual-signup navigation so that after successful signup the app routes to `/profile-setup` and renders the form immediately (no spinner loop).
- Update protected-route/profile-completeness logic to avoid indefinite loading when backend profile checks are unauthorized/unavailable, falling back to manual-auth stored state.
- Implement the Jobseeker Profile Setup form with fields: Name, Mobile Number, Email ID, Current Location, and Experience Status dropdown (Fresher/Experienced).
- When Experience Status is Experienced, add UI to add/edit/remove up to 5 experience entries (Company Name, Designation, Process, Last Salary, Duration with months/years capture) with clear English validation and preventing a 6th entry.
- Persist manual-auth profile completion state on successful submit and route users to the correct next page: `/jobseeker/dashboard` (jobseeker) or `/employer/candidates` (employer), ensuring refresh does not redirect back to `/profile-setup`.

**User-visible outcome:** After signing up, users reliably reach the Profile Setup page without buffering; jobseekers can complete their profile (including up to 5 experiences if experienced) and then are routed to the appropriate dashboard page without being repeatedly forced back into profile setup.
