import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    department : Text;
    employeeId : ?Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // HR Module Types
  public type Employee = {
    id : Nat;
    name : Text;
    email : Text;
    department : Text;
    role : Text;
    salary : Float;
    hireDate : Time.Time;
    status : Text;
  };

  public type AttendanceStatus = {
    #present;
    #absent;
    #halfDay;
  };

  public type Attendance = {
    employeeId : Nat;
    date : Text;
    status : AttendanceStatus;
  };

  public type Location = {
    employeeId : Nat;
    latitude : Float;
    longitude : Float;
    timestamp : Time.Time;
    note : Text;
  };

  public type OfferLetter = {
    employeeId : Nat;
    content : Text;
    dateIssued : Time.Time;
  };

  public type JoiningLetter = {
    employeeId : Nat;
    content : Text;
    dateIssued : Time.Time;
  };

  public type SalarySlip = {
    employeeId : Nat;
    month : Text;
    year : Nat;
    salary : Float;
    content : Text;
  };

  // DSA Loan Management Types
  public type DSAPartner = {
    name : Text;
    contactPerson : Text;
    phone : Text;
    region : Text;
    commissionPercentage : Float;
    status : Text;
  };

  public type DSAConnector = {
    name : Text;
    phone : Text;
    email : Text;
    partnerName : Text;
    status : Text;
  };

  public type LoanApplication = {
    id : Nat;
    applicantName : Text;
    loanType : Text;
    amount : Float;
    status : Text;
    agentName : Text;
    date : Time.Time;
    notes : Text;
  };

  // Accounting Types
  public type Transaction = {
    id : Nat;
    amount : Float;
    category : Text;
    description : Text;
    date : Time.Time;
    transactionType : Text;
  };

  // State
  let employees = Map.empty<Nat, Employee>();
  let attendances = List.empty<Attendance>();
  let locations = List.empty<Location>();
  let offerLetters = List.empty<OfferLetter>();
  let joiningLetters = List.empty<JoiningLetter>();
  let salarySlips = List.empty<SalarySlip>();
  let dsaPartners = List.empty<DSAPartner>();
  let dsaConnectors = List.empty<DSAConnector>();
  let loanApplications = Map.empty<Nat, LoanApplication>();
  let transactions = Map.empty<Nat, Transaction>();
  let departments = List.fromArray(["HR", "Finance", "Marketing", "Ops"]);
  var employeeIdCounter = 1;
  var loanIdCounter = 1;
  var transactionIdCounter = 1;

  // Helper function to get employee ID for caller
  func getCallerEmployeeId(caller : Principal) : ?Nat {
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.employeeId };
    };
  };

  // Helper function to check if caller can access employee data
  func canAccessEmployeeData(caller : Principal, employeeId : Nat) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (getCallerEmployeeId(caller)) {
      case (null) { false };
      case (?callerEmpId) { callerEmpId == employeeId };
    };
  };

  // HR Module Functions
  public shared ({ caller }) func addEmployee(name : Text, email : Text, department : Text, role : Text, salary : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add employees");
    };
    let employee : Employee = {
      id = employeeIdCounter;
      name;
      email;
      department;
      role;
      salary;
      hireDate = Time.now();
      status = "Active";
    };
    employees.add(employeeIdCounter, employee);
    employeeIdCounter += 1;
  };

  public query ({ caller }) func getEmployee(id : Nat) : async Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view employee data");
    };
    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?employee) { employee };
    };
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view employee data");
    };
    employees.values().toArray();
  };

  public shared ({ caller }) func recordAttendance(employeeId : Nat, date : Text, status : AttendanceStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record attendance");
    };
    switch (employees.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?_) {};
    };
    if (not canAccessEmployeeData(caller, employeeId)) {
      Runtime.trap("Unauthorized: Can only record your own attendance");
    };
    let attendance : Attendance = { employeeId; date; status };
    attendances.add(attendance);
  };

  public query ({ caller }) func getAttendance(employeeId : Nat) : async [Attendance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance data");
    };
    if (not canAccessEmployeeData(caller, employeeId)) {
      Runtime.trap("Unauthorized: Can only view your own attendance");
    };
    attendances.values().toArray().filter(func(a) { a.employeeId == employeeId });
  };

  public query ({ caller }) func getDepartments() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view departments");
    };
    departments.toArray();
  };

  public shared ({ caller }) func recordLocation(employeeId : Nat, latitude : Float, longitude : Float, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record locations");
    };
    switch (employees.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?_) {};
    };
    if (not canAccessEmployeeData(caller, employeeId)) {
      Runtime.trap("Unauthorized: Can only record your own location");
    };
    let location : Location = {
      employeeId;
      latitude;
      longitude;
      timestamp = Time.now();
      note;
    };
    locations.add(location);
  };

  public query ({ caller }) func getEmployeeLocations(employeeId : Nat) : async [Location] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view locations");
    };
    if (not canAccessEmployeeData(caller, employeeId)) {
      Runtime.trap("Unauthorized: Can only view your own locations");
    };
    locations.values().toArray().filter(func(l) { l.employeeId == employeeId });
  };

  public shared ({ caller }) func generateOfferLetter(employeeId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate offer letters");
    };
    switch (employees.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?_) {};
    };
    let offerLetter : OfferLetter = {
      employeeId;
      content;
      dateIssued = Time.now();
    };
    offerLetters.add(offerLetter);
  };

  public shared ({ caller }) func generateJoiningLetter(employeeId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate joining letters");
    };
    switch (employees.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?_) {};
    };
    let joiningLetter : JoiningLetter = {
      employeeId;
      content;
      dateIssued = Time.now();
    };
    joiningLetters.add(joiningLetter);
  };

  public shared ({ caller }) func generateSalarySlip(employeeId : Nat, month : Text, year : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate salary slips");
    };
    let employee = switch (employees.get(employeeId)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?e) { e };
    };
    let salarySlip : SalarySlip = {
      employeeId;
      month;
      year;
      salary = employee.salary;
      content;
    };
    salarySlips.add(salarySlip);
  };

  public query ({ caller }) func getOfferLetters(employeeId : Nat) : async [OfferLetter] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view offer letters");
    };
    if (not canAccessEmployeeData(caller, employeeId)) {
      Runtime.trap("Unauthorized: Can only view your own offer letters");
    };
    offerLetters.values().toArray().filter(func(o) { o.employeeId == employeeId });
  };

  public query ({ caller }) func getJoiningLetters(employeeId : Nat) : async [JoiningLetter] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view joining letters");
    };
    if (not canAccessEmployeeData(caller, employeeId)) {
      Runtime.trap("Unauthorized: Can only view your own joining letters");
    };
    joiningLetters.values().toArray().filter(func(j) { j.employeeId == employeeId });
  };

  public query ({ caller }) func getSalarySlips(employeeId : Nat) : async [SalarySlip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view salary slips");
    };
    if (not canAccessEmployeeData(caller, employeeId)) {
      Runtime.trap("Unauthorized: Can only view your own salary slips");
    };
    salarySlips.values().toArray().filter(func(s) { s.employeeId == employeeId });
  };

  // DSA Loan Management Functions
  public shared ({ caller }) func addDSAPartner(name : Text, contactPerson : Text, phone : Text, region : Text, commissionPercentage : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add DSA partners");
    };
    let partner : DSAPartner = {
      name;
      contactPerson;
      phone;
      region;
      commissionPercentage;
      status = "Active";
    };
    dsaPartners.add(partner);
  };

  public query ({ caller }) func getDSAPartners() : async [DSAPartner] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view DSA partners");
    };
    dsaPartners.toArray();
  };

  public shared ({ caller }) func addDSAConnector(name : Text, phone : Text, email : Text, partnerName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add DSA connectors");
    };
    let connector : DSAConnector = {
      name;
      phone;
      email;
      partnerName;
      status = "Active";
    };
    dsaConnectors.add(connector);
  };

  public query ({ caller }) func getDSAConnectors() : async [DSAConnector] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view DSA connectors");
    };
    dsaConnectors.toArray();
  };

  public shared ({ caller }) func applyForLoan(applicantName : Text, loanType : Text, amount : Float, agentName : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply for loans");
    };
    let application : LoanApplication = {
      id = loanIdCounter;
      applicantName;
      loanType;
      amount;
      status = "Pending";
      agentName;
      date = Time.now();
      notes;
    };
    loanApplications.add(loanIdCounter, application);
    loanIdCounter += 1;
  };

  public query ({ caller }) func getLoanApplication(id : Nat) : async LoanApplication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view loan applications");
    };
    switch (loanApplications.get(id)) {
      case (null) { Runtime.trap("Loan application not found") };
      case (?app) { app };
    };
  };

  public query ({ caller }) func getAllLoanApplications() : async [LoanApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view loan applications");
    };
    loanApplications.values().toArray();
  };

  // Accounting Functions
  public shared ({ caller }) func addTransaction(amount : Float, category : Text, description : Text, transactionType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add transactions");
    };
    let transaction : Transaction = {
      id = transactionIdCounter;
      amount;
      category;
      description;
      date = Time.now();
      transactionType;
    };
    transactions.add(transactionIdCounter, transaction);
    transactionIdCounter += 1;
  };

  public query ({ caller }) func getTransaction(id : Nat) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    switch (transactions.get(id)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) { transaction };
    };
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().toArray();
  };

  // Seed Data (for demo purposes)
  public shared ({ caller }) func seedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };
    ignore await addEmployee("Alice", "alice@company.com", "HR", "Manager", 60000.0);
    ignore await addEmployee("Bob", "bob@company.com", "Finance", "Analyst", 50000.0);
    ignore await applyForLoan("John Doe", "Personal", 10000.0, "Agent Smith", "First loan application");
    ignore await addTransaction(2000.0, "Salary", "Monthly salary payout", "Expense");
    ignore await addDSAPartner("Partner1", "Contact1", "1234567890", "Region1", 5.0);
    ignore await addDSAConnector("Connector1", "0987654321", "connector1@example.com", "Partner1");
  };
};
