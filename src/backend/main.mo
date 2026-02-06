import Array "mo:core/Array";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type CandidateProfile = {
    fullName : Text;
    skills : [Text];
    resume : Text;
  };

  public type EmployerProfile = {
    companyName : Text;
    companyWebsite : Text;
    companyLogo : Text;
    description : Text;
  };

  public type UserProfile = {
    role : AccessControl.UserRole;
    bio : Text;
    linkedin : Text;
    github : Text;
    candidate : ?CandidateProfile;
    employer : ?EmployerProfile;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Text.compare(profile1.bio, profile2.bio)) {
        case (#equal) { Text.compare(profile1.linkedin, profile2.linkedin) };
        case (order) { order };
      };
    };
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

  module Job {
    public func compare(job1 : Job, job2 : Job) : Order.Order {
      switch (Text.compare(job1.title, job2.title)) {
        case (#equal) { Text.compare(job1.company, job2.company) };
        case (order) { order };
      };
    };
  };

  public type JobApplication = {
    id : Nat;
    jobId : Nat;
    candidate : Principal;
    coverLetter : Text;
    status : ApplicationStatus;
  };

  public type ApplicationStatus = {
    #applied;
    #interview;
    #offer;
    #rejected;
    #withdrawn;
    #hired;
  };

  public type ApplicationInput = {
    jobId : Nat;
    coverLetter : Text;
  };

  let jobs = Map.empty<Nat, Job>();
  let applications = Map.empty<Nat, JobApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextJobId = 1;
  var nextApplicationId = 1;

  public shared ({ caller }) func chooseRole(role : AccessControl.UserRole) : async () {
    AccessControl.initialize(accessControlState, caller, "0", "0");
    let profile : UserProfile = {
      role;
      bio = "";
      linkedin = "";
      github = "";
      candidate = null;
      employer = null;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(p : Principal) : async UserProfile {
    if (caller != p and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(p)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    userProfiles.values().toArray().sort();
  };

  public shared ({ caller }) func createJob(job : Job) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create jobs");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        switch (profile.employer) {
          case (null) { Runtime.trap("Unauthorized: Only employers can create jobs") };
          case (?_) {
            let newJob : Job = {
              job with id = nextJobId;
              employer = caller;
            };
            jobs.add(nextJobId, newJob);
            nextJobId += 1;
          };
        };
      };
    };
  };

  public query ({ caller }) func getJobs() : async [Job] {
    jobs.values().toArray().sort();
  };

  public query ({ caller }) func getJobsByEmployer(employer : Principal) : async [Job] {
    jobs.values().filter(func(job) { job.employer == employer }).toArray().sort();
  };

  public query ({ caller }) func getJob(id : Nat) : async Job {
    switch (jobs.get(id)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?job) { job };
    };
  };

  public shared ({ caller }) func deleteJob(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete jobs");
    };
    switch (jobs.get(id)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?job) {
        if (job.employer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the employer can delete this job");
        };
        jobs.remove(id);
      };
    };
  };

  public shared ({ caller }) func applyForJob(application : ApplicationInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply for jobs");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        switch (profile.candidate) {
          case (null) { Runtime.trap("Unauthorized: Only candidates can apply for jobs") };
          case (?_) {
            switch (jobs.get(application.jobId)) {
              case (null) { Runtime.trap("Job does not exist") };
              case (?_) {
                let newApplication : JobApplication = {
                  id = nextApplicationId;
                  jobId = application.jobId;
                  candidate = caller;
                  coverLetter = application.coverLetter;
                  status = #applied;
                };
                applications.add(nextApplicationId, newApplication);
                nextApplicationId += 1;
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getApplications() : async [JobApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all applications");
    };
    applications.values().toArray();
  };

  public query ({ caller }) func getApplicationsForJob(jobId : Nat) : async [JobApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view applications");
    };
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job does not exist") };
      case (?job) {
        if (job.employer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the employer can view applications for this job");
        };
        applications.values().filter(func(app) { app.jobId == jobId }).toArray();
      };
    };
  };

  public query ({ caller }) func getApplicationsForCandidate(candidate : Principal) : async [JobApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view applications");
    };
    if (caller != candidate and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own applications");
    };
    applications.values().filter(func(app) { app.candidate == candidate }).toArray();
  };

  public shared ({ caller }) func updateApplicationStatus(id : Nat, status : ApplicationStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update application status");
    };
    switch (applications.get(id)) {
      case (null) { Runtime.trap("Application does not exist") };
      case (?application) {
        switch (jobs.get(application.jobId)) {
          case (null) { Runtime.trap("Associated job does not exist") };
          case (?job) {
            if (job.employer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only the employer can update this application");
            };
            let updatedApplication : JobApplication = {
              application with status
            };
            applications.add(id, updatedApplication);
          };
        };
      };
    };
  };
};
