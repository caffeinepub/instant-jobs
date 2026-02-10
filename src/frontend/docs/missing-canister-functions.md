# Missing Canister Functions

This document tracks backend methods that are required by the frontend but not yet implemented in the Motoko canister.

## Actor Diagnostics System

The frontend includes an actor diagnostics system that checks for missing backend methods on initialization:

- **Location**: `frontend/src/utils/actorDiagnostics.ts`
- **Usage**: Automatically runs when the actor is initialized in `useActor.ts`
- **Output**: Console logs showing which methods are present/missing

## Currently Required Methods

The following methods are used by the frontend and should be present in the backend:

### User Profile Management
- ✅ `getCallerUserProfile()` - Get current user's profile
- ✅ `saveCallerUserProfile(profile)` - Save current user's profile

### Candidate Directory & Credits
- ✅ `getCandidateDirectory()` - Get all candidate profiles (employer only)
- ✅ `getCreditBalance()` - Get employer's credit balance
- ✅ `getCreditCostPerUnlock()` - Get cost to unlock a profile
- ✅ `unlockCandidateProfile(principal)` - Unlock a candidate profile

### Admin Operations
- ✅ `getAllEmployers()` - Get all employers with credit info
- ✅ `getAllJobseekers()` - Get all jobseeker principals
- ✅ `getAllUnlockLogs()` - Get all unlock activity logs
- ✅ `addCredits(principal, amount)` - Add credits to employer
- ✅ `deductCredits(principal, amount)` - Deduct credits from employer
- ✅ `setCreditCostPerUnlock(cost)` - Set unlock cost

### Jobs & Applications (NOT IMPLEMENTED IN BACKEND)
- ❌ `getJobs()` - Get all job postings
- ❌ `getJob(id)` - Get a specific job by ID
- ❌ `getJobsByEmployer()` - Get jobs posted by current employer
- ❌ `createJob(job)` - Create a new job posting
- ❌ `deleteJob(id)` - Delete a job posting
- ❌ `applyForJob(application)` - Submit a job application
- ❌ `getApplicationsForCandidate()` - Get applications for current candidate
- ❌ `getApplicationsForJob(jobId)` - Get applications for a specific job
- ❌ `updateApplicationStatus(appId, status)` - Update application status

### Authentication (NOT IMPLEMENTED IN BACKEND)
- ❌ `login(email, password, role)` - Authenticate user and return session token
- ❌ `logout(token)` - Invalidate session token
- ❌ `validateSession(token)` - Check if session token is valid

## Known Issues

### 1. Candidate Directory - Missing Principal IDs
**Issue**: The `getCandidateDirectory()` method returns `UserProfile[]` but doesn't include the Principal ID for each candidate.

**Impact**: Employers cannot unlock candidates because we don't know their Principal IDs.

**Solution**: Backend should return a tuple or object that includes both the Principal and the UserProfile:
