import Array "mo:core/Array";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Specify data migration via with-clause
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type MobileNumber = Text;

  public type CandidateProfile = {
    fullName : Text;
    mobileNumber : MobileNumber;
    email : Text;
    currentOrLastCompany : Text;
    jobRole : Text;
    totalExperience : Nat;
    lastDrawnSalary : Nat;
    preferredLocation : Text;
    isActive : Bool;
    skills : [Text];
    resume : Text;
  };

  public type EmployerProfile = {
    companyName : Text;
    contactPersonName : Text;
    mobileNumber : MobileNumber;
    email : Text;
    businessLocation : Text;
    companyWebsite : Text;
    companyLogo : Text;
    description : Text;
  };

  public type UserProfile = {
    bio : Text;
    linkedin : Text;
    github : Text;
    candidate : ?CandidateProfile;
    employer : ?EmployerProfile;
  };

  public type Employer = {
    principal : Principal;
    credits : Nat;
    creditsPurchased : Nat;
  };

  public type CandidateCreditUsage = {
    creditsUsed : Nat;
    unlockLogs : [UnlockRecord];
  };

  public type UnlockRecord = {
    employer : Principal;
    candidate : Principal;
    timestamp : Int;
    creditsUsed : Nat;
    profileDetails : CandidateProfile;
  };

  public type UnlockResult = {
    currentCredits : Nat;
    status : Text;
    remainingCredits : Nat;
  };

  public type Job = {
    id : Nat;
    title : Text;
    description : Text;
    company : Text;
    location : Text;
    salary : ?Nat;
    requirements : [Text];
    employer : Principal;
  };

  public type ApplicationStatus = {
    #applied;
    #interview;
    #offer;
    #rejected;
    #withdrawn;
    #hired;
  };

  public type JobApplication = {
    id : Nat;
    jobId : Nat;
    candidate : Principal;
    coverLetter : Text;
    status : ApplicationStatus;
  };

  public type ApplicationInput = {
    jobId : Nat;
    coverLetter : Text;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Text.compare(profile1.bio, profile2.bio)) {
        case (#equal) { Text.compare(profile1.linkedin, profile2.linkedin) };
        case (order) { order };
      };
    };
  };

  module Job {
    public func compare(job1 : Job, job2 : Job) : Order.Order {
      switch (Text.compare(job1.title, job2.title)) {
        case (#equal) { Text.compare(job1.company, job2.company) };
        case (order) { order };
      };
    };
  };

  let jobs = Map.empty<Nat, Job>();
  let applications = Map.empty<Nat, JobApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let employerCredits = Map.empty<Principal, Employer>();
  let candidateCreditUsage = Map.empty<Principal, CandidateCreditUsage>();
  let employerUnlockedProfiles = Map.empty<Principal, Set.Set<Principal>>();
  let allUnlockLogs = Map.empty<Principal, [UnlockRecord]>();
  let unlockLogs = Map.empty<Principal, [UnlockRecord]>();
  let deductLogs = Map.empty<Principal, [Int]>();
  let creditPurchaseLogs = Map.empty<Principal, [Int]>();

  var nextJobId = 1;
  var nextApplicationId = 1;
  var jobUnlockCreditCost = 10;

  // Helper function to check if caller is an employer
  private func isEmployer(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.employer) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  // Helper function to check if caller is a jobseeker
  private func isJobseeker(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.candidate) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  // Admin-only: Set credit cost per unlock
  public shared ({ caller }) func setCreditCostPerUnlock(cost : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set credit cost");
    };
    jobUnlockCreditCost := cost;
  };

  // Any authenticated user can view the credit cost
  public query ({ caller }) func getCreditCostPerUnlock() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    jobUnlockCreditCost;
  };

  // Admin-only: Add credits to an employer
  public shared ({ caller }) func addCredits(employerPrincipal : Principal, credits : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add credits");
    };

    // Verify target is an employer
    if (not isEmployer(employerPrincipal)) {
      Runtime.trap("Target principal is not an employer");
    };

    let newCredits = switch (employerCredits.get(employerPrincipal)) {
      case (null) { credits };
      case (?employer) { employer.credits + credits };
    };

    let creditsPurchased = switch (employerCredits.get(employerPrincipal)) {
      case (null) { credits };
      case (?employer) { employer.creditsPurchased + credits };
    };

    let employer = {
      principal = employerPrincipal;
      credits = newCredits;
      creditsPurchased;
    };

    employerCredits.add(employerPrincipal, employer);

    let currentLogs = switch (creditPurchaseLogs.get(employerPrincipal)) {
      case (null) { [] };
      case (?logs) { logs };
    };
    creditPurchaseLogs.add(employerPrincipal, currentLogs.concat([Time.now()]));
  };

  // Admin-only: Deduct credits from an employer
  public shared ({ caller }) func deductCredits(employerPrincipal : Principal, credits : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can deduct credits");
    };

    // Verify target is an employer
    if (not isEmployer(employerPrincipal)) {
      Runtime.trap("Target principal is not an employer");
    };

    switch (employerCredits.get(employerPrincipal)) {
      case (null) { Runtime.trap("Employer record not found") };
      case (?employer) {
        if (employer.credits < credits) {
          Runtime.trap("Failed: Cannot deduct more credits than balance");
        };
        let newCredits = employer.credits - credits;
        employerCredits.add(employerPrincipal, { employer with credits = newCredits });

        let currentLogs = switch (deductLogs.get(employerPrincipal)) {
          case (null) { [] };
          case (?logs) { logs };
        };
        deductLogs.add(employerPrincipal, currentLogs.concat([Time.now()]));
      };
    };
  };

  // Employer-only: Unlock a candidate profile
  public shared ({ caller }) func unlockCandidateProfile(candidatePrincipal : Principal) : async UnlockResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Verify caller is an employer
    if (not isEmployer(caller)) {
      Runtime.trap("Unauthorized: Only employers can unlock candidate profiles");
    };

    // Verify target is a jobseeker
    if (not isJobseeker(candidatePrincipal)) {
      Runtime.trap("Target principal is not a jobseeker");
    };

    switch (employerCredits.get(caller)) {
      case (null) { Runtime.trap("Employer record not found") };
      case (?employer) {
        if (employer.credits < jobUnlockCreditCost) {
          Runtime.trap("Failed: Insufficient credits to unlock this profile");
        };

        let employerSet = switch (employerUnlockedProfiles.get(caller)) {
          case (null) { Set.empty<Principal>() };
          case (?set) { set };
        };

        if (employerSet.contains(candidatePrincipal)) {
          return {
            currentCredits = employer.credits;
            status = "Already unlocked this profile";
            remainingCredits = employer.credits;
          };
        };

        let candidateRecord = switch (userProfiles.get(candidatePrincipal)) {
          case (null) { Runtime.trap("Candidate profile not found") };
          case (?profile) {
            switch (profile.candidate) {
              case (null) { Runtime.trap("Jobseeker details not available") };
              case (?candidate) { candidate };
            };
          };
        };

        // Deduct credits
        let newCredits = employer.credits - jobUnlockCreditCost;
        employerCredits.add(caller, { employer with credits = newCredits });

        let unlockLog : UnlockRecord = {
          employer = caller;
          candidate = candidatePrincipal;
          timestamp = Time.now();
          creditsUsed = jobUnlockCreditCost;
          profileDetails = candidateRecord;
        };

        // Update candidate's unlock logs
        let candidateUsage = switch (candidateCreditUsage.get(candidatePrincipal)) {
          case (null) {
            { creditsUsed = jobUnlockCreditCost; unlockLogs = [unlockLog] };
          };
          case (?usage) {
            {
              creditsUsed = usage.creditsUsed + jobUnlockCreditCost;
              unlockLogs = usage.unlockLogs.concat([unlockLog]);
            };
          };
        };
        candidateCreditUsage.add(candidatePrincipal, candidateUsage);

        // Update employer's unlocked profiles
        employerSet.add(candidatePrincipal);
        employerUnlockedProfiles.add(caller, employerSet);

        let allUnlocks = switch (allUnlockLogs.get(candidatePrincipal)) {
          case (null) { [unlockLog] };
          case (?logs) { logs.concat([unlockLog]) };
        };
        allUnlockLogs.add(candidatePrincipal, allUnlocks);

        {
          currentCredits = newCredits;
          status = "Unlocked successfully";
          remainingCredits = newCredits;
        };
      };
    };
  };

  // Employer-only: Get candidate directory
  public query ({ caller }) func getCandidateDirectory() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Verify caller is an employer
    if (not isEmployer(caller)) {
      Runtime.trap("Unauthorized: Only employers can browse candidate directory");
    };

    let candidates = userProfiles.values().filter(func(profile : UserProfile) : Bool {
      profile.candidate != null;
    }).toArray();

    candidates;
  };

  let defaultTimeout : Int = 5_184_000_000_000;

  // Admin-only: Set session timeout
  public shared ({ caller }) func setSessionTimeout(timeout : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set session timeout");
    };
  };

  // Authenticated users can view session timeout
  public query ({ caller }) func getSessionTimeout() : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    defaultTimeout;
  };

  var sessionTokens = Map.empty<Text, (Principal, Int)>();

  // Get caller's own profile (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Save caller's own profile (required by frontend)
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Get any user's profile (admin can view any, users can view their own)
  public query ({ caller }) func getUserProfile(p : Principal) : async ?UserProfile {
    if (caller != p and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(p);
  };

  // Legacy method for compatibility
  public query ({ caller }) func getCurrentUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    userProfiles.get(caller);
  };

  // Legacy method for compatibility
  public query ({ caller }) func getProfile(p : Principal) : async UserProfile {
    if (caller != p and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(p)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  // Employer can check their own credit balance
  public query ({ caller }) func getCreditBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Verify caller is an employer
    if (not isEmployer(caller)) {
      Runtime.trap("Unauthorized: Only employers have credit balances");
    };

    switch (employerCredits.get(caller)) {
      case (null) { 0 };
      case (?employer) { employer.credits };
    };
  };

  // Admin-only: Get all unlock logs for audit
  public query ({ caller }) func getAllUnlockLogs() : async [(Principal, [UnlockRecord])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view unlock logs");
    };
    allUnlockLogs.entries().toArray();
  };

  // Admin-only: Get employer credit details
  public query ({ caller }) func getEmployerCredits(employerPrincipal : Principal) : async ?Employer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view employer credits");
    };
    employerCredits.get(employerPrincipal);
  };

  // Admin-only: Get all employers
  public query ({ caller }) func getAllEmployers() : async [Employer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all employers");
    };
    employerCredits.values().toArray();
  };

  // Admin-only: Get all jobseekers
  public query ({ caller }) func getAllJobseekers() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all jobseekers");
    };
    let jobseekers = userProfiles.entries().filter(func((p, profile) : (Principal, UserProfile)) : Bool {
      profile.candidate != null;
    }).map(func((p, _) : (Principal, UserProfile)) : Principal { p }).toArray();
    jobseekers;
  };
};
