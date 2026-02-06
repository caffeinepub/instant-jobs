import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
  public type CandidateProfile = {
    fullName : Text;
    mobileNumber : Text;
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
    mobileNumber : Text;
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

  public type OldCandidateProfile = {
    fullName : Text;
    skills : [Text];
    resume : Text;
  };

  public type OldEmployerProfile = {
    companyName : Text;
    companyWebsite : Text;
    companyLogo : Text;
    description : Text;
  };

  public type OldUserProfile = {
    bio : Text;
    linkedin : Text;
    github : Text;
    candidate : ?OldCandidateProfile;
    employer : ?OldEmployerProfile;
  };

  public type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    jobs : Map.Map<Nat, Job>;
    applications : Map.Map<Nat, JobApplication>;
    nextJobId : Nat;
    nextApplicationId : Nat;
  };

  public type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    jobs : Map.Map<Nat, Job>;
    applications : Map.Map<Nat, JobApplication>;
    nextJobId : Nat;
    nextApplicationId : Nat;
  };

  module CandidateProfile {
    public func fromOld(old : OldCandidateProfile) : CandidateProfile {
      {
        fullName = old.fullName;
        mobileNumber = "";
        email = "";
        currentOrLastCompany = "";
        jobRole = "";
        totalExperience = 0;
        lastDrawnSalary = 0;
        preferredLocation = "";
        isActive = true;
        skills = old.skills;
        resume = old.resume;
      };
    };
  };

  module EmployerProfile {
    public func fromOld(old : OldEmployerProfile) : EmployerProfile {
      {
        companyName = old.companyName;
        contactPersonName = "";
        mobileNumber = "";
        email = "";
        businessLocation = "";
        companyWebsite = old.companyWebsite;
        companyLogo = old.companyLogo;
        description = old.description;
      };
    };
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, UserProfile>(
      func(_p, oldProfile) {
        {
          bio = oldProfile.bio;
          linkedin = oldProfile.linkedin;
          github = oldProfile.github;
          candidate = oldProfile.candidate.map(CandidateProfile.fromOld);
          employer = oldProfile.employer.map(EmployerProfile.fromOld);
        };
      }
    );
    {
      old with
      userProfiles = newUserProfiles;
    };
  };
};
