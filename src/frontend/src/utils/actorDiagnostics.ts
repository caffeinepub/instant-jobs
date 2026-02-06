/**
 * Actor diagnostics utility to detect missing backend methods
 */

export interface ActorMethodCheck {
  methodName: string;
  usedIn: string;
  exists: boolean;
}

export interface ActorDiagnosticsReport {
  allMethodsPresent: boolean;
  missingMethods: string[];
  checks: ActorMethodCheck[];
}

/**
 * List of all required backend methods and where they're used in the frontend
 */
const REQUIRED_METHODS = [
  { name: 'chooseRole', usedIn: 'useChooseRole (RoleSetupModal)' },
  { name: 'getCallerUserProfile', usedIn: 'useGetCallerUserProfile (RoleSetupModal, Auth checks)' },
  { name: 'saveCallerUserProfile', usedIn: 'useSaveCallerUserProfile (RoleSetupModal)' },
  { name: 'getJobs', usedIn: 'useGetJobs (JobsBrowsePage)' },
  { name: 'getJob', usedIn: 'useGetJob (JobDetailPage, EmployerJobApplicationsPage)' },
  { name: 'getJobsByEmployer', usedIn: 'useGetJobsByEmployer (EmployerDashboardPage)' },
  { name: 'createJob', usedIn: 'useCreateJob (EmployerJobForm)' },
  { name: 'deleteJob', usedIn: 'useDeleteJob (EmployerDashboardPage)' },
  { name: 'applyForJob', usedIn: 'useApplyForJob (CandidateApplyForm)' },
  { name: 'getApplicationsForCandidate', usedIn: 'useGetCandidateApplications (CandidateDashboardPage)' },
  { name: 'getApplicationsForJob', usedIn: 'useGetJobApplications (EmployerJobApplicationsPage)' },
  { name: 'updateApplicationStatus', usedIn: 'useUpdateApplicationStatus (EmployerJobApplicationsPage)' },
  { name: 'getCandidateDirectory', usedIn: 'useGetCandidateDirectory (EmployerCandidatesPage)' },
];

/**
 * Check if an actor has all required methods
 */
export function checkActorMethods(actor: any): ActorDiagnosticsReport {
  const checks: ActorMethodCheck[] = REQUIRED_METHODS.map(({ name, usedIn }) => ({
    methodName: name,
    usedIn,
    exists: typeof actor?.[name] === 'function',
  }));

  const missingMethods = checks.filter((check) => !check.exists).map((check) => check.methodName);

  return {
    allMethodsPresent: missingMethods.length === 0,
    missingMethods,
    checks,
  };
}

/**
 * Log a diagnostic report to the console
 */
export function logActorDiagnostics(report: ActorDiagnosticsReport): void {
  if (report.allMethodsPresent) {
    console.log('✅ Actor diagnostics: All required methods are present');
    return;
  }

  console.group('⚠️ Actor diagnostics: Missing backend methods detected');
  console.log(`Missing ${report.missingMethods.length} method(s):`);
  
  report.checks
    .filter((check) => !check.exists)
    .forEach((check) => {
      console.log(`  ❌ ${check.methodName} (used in: ${check.usedIn})`);
    });

  console.log('\nAll method checks:');
  console.table(
    report.checks.map((check) => ({
      Method: check.methodName,
      'Used In': check.usedIn,
      Status: check.exists ? '✅' : '❌',
    }))
  );

  console.groupEnd();
}
