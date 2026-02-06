# Missing Canister Functions - Diagnostics Report

## Overview
This document tracks any missing backend canister methods detected during runtime and provides reproduction steps for debugging.

## Diagnostic System
The frontend includes an automated diagnostics system that:
1. Checks all required backend methods when the actor is initialized
2. Logs a detailed report to the browser console
3. Guards all actor method calls to catch missing methods early
4. Provides user-friendly error messages when methods are unavailable

## Required Backend Methods
The following methods are required by the frontend and are checked on actor initialization:

| Method Name | Used In | Status |
|-------------|---------|--------|
| `chooseRole` | useChooseRole (RoleSetupModal) | ✅ Present |
| `getCallerUserProfile` | useGetCallerUserProfile (Auth checks) | ✅ Present |
| `saveCallerUserProfile` | useSaveCallerUserProfile (RoleSetupModal) | ✅ Present |
| `getJobs` | useGetJobs (JobsBrowsePage) | ✅ Present |
| `getJob` | useGetJob (JobDetailPage) | ✅ Present |
| `getJobsByEmployer` | useGetJobsByEmployer (EmployerDashboardPage) | ✅ Present |
| `createJob` | useCreateJob (EmployerJobForm) | ✅ Present |
| `deleteJob` | useDeleteJob (EmployerDashboardPage) | ✅ Present |
| `applyForJob` | useApplyForJob (CandidateApplyForm) | ✅ Present |
| `getApplicationsForCandidate` | useGetCandidateApplications (CandidateDashboardPage) | ✅ Present |
| `getApplicationsForJob` | useGetJobApplications (EmployerJobApplicationsPage) | ✅ Present |
| `updateApplicationStatus` | useUpdateApplicationStatus (EmployerJobApplicationsPage) | ✅ Present |

## How to Check for Missing Methods

### 1. Browser Console
After logging in, open the browser console (F12) and look for:
- ✅ "Actor diagnostics: All required methods are present" - All good!
- ⚠️ "Actor diagnostics: Missing backend methods detected" - Methods are missing

### 2. User Actions
If methods are missing, users will see friendly error messages:
- "This feature is temporarily unavailable. Please try again later."

### 3. Console Errors
Look for errors containing:
- "is not a function"
- "method not found"
- "Backend method '...' is not available"

## Reproduction Steps

### Candidate Flow
1. Sign in with Internet Identity
2. Choose "Candidate" role and complete profile setup
3. Browse jobs at `/jobs`
4. Click on a job to view details
5. Click "Apply Now" and submit application
6. View applications at `/candidate/dashboard`

**Expected:** All steps complete without errors
**If errors occur:** Note which step fails and check console for method name

### Employer Flow
1. Sign in with Internet Identity
2. Choose "Employer" role and complete profile setup
3. Go to `/employer/dashboard`
4. Click "Post New Job" and create a job
5. View the job in the dashboard
6. Click "View Applications" on a job
7. Update an application status

**Expected:** All steps complete without errors
**If errors occur:** Note which step fails and check console for method name

## Known Issues
Currently: **No known issues** - All required backend methods are present and functional.

## Error Handling
The frontend includes robust error handling:
- All actor calls are guarded with method existence checks
- Missing methods throw `ActorMethodMissingError` with context
- User-facing errors are normalized to friendly messages
- Forms remain usable after errors (no broken state)

## Last Updated
February 6, 2026 - Initial diagnostics system implementation
