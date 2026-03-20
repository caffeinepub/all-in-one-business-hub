import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    note: string;
    employeeId: bigint;
    longitude: number;
    timestamp: Time;
}
export interface SalarySlip {
    month: string;
    content: string;
    salary: number;
    year: bigint;
    employeeId: bigint;
}
export type Time = bigint;
export interface Attendance {
    status: AttendanceStatus;
    date: string;
    employeeId: bigint;
}
export interface DSAConnector {
    status: string;
    partnerName: string;
    name: string;
    email: string;
    phone: string;
}
export interface Transaction {
    id: bigint;
    transactionType: string;
    date: Time;
    description: string;
    category: string;
    amount: number;
}
export interface OfferLetter {
    dateIssued: Time;
    content: string;
    employeeId: bigint;
}
export interface LoanApplication {
    id: bigint;
    status: string;
    applicantName: string;
    date: Time;
    agentName: string;
    loanType: string;
    notes: string;
    amount: number;
}
export interface JoiningLetter {
    dateIssued: Time;
    content: string;
    employeeId: bigint;
}
export interface Employee {
    id: bigint;
    status: string;
    salary: number;
    hireDate: Time;
    name: string;
    role: string;
    email: string;
    department: string;
}
export interface DSAPartner {
    region: string;
    status: string;
    name: string;
    contactPerson: string;
    phone: string;
    commissionPercentage: number;
}
export interface UserProfile {
    name: string;
    email: string;
    employeeId?: bigint;
    department: string;
}
export enum AttendanceStatus {
    halfDay = "halfDay",
    present = "present",
    absent = "absent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDSAConnector(name: string, phone: string, email: string, partnerName: string): Promise<void>;
    addDSAPartner(name: string, contactPerson: string, phone: string, region: string, commissionPercentage: number): Promise<void>;
    addEmployee(name: string, email: string, department: string, role: string, salary: number): Promise<void>;
    addTransaction(amount: number, category: string, description: string, transactionType: string): Promise<void>;
    applyForLoan(applicantName: string, loanType: string, amount: number, agentName: string, notes: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateJoiningLetter(employeeId: bigint, content: string): Promise<void>;
    generateOfferLetter(employeeId: bigint, content: string): Promise<void>;
    generateSalarySlip(employeeId: bigint, month: string, year: bigint, content: string): Promise<void>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAllLoanApplications(): Promise<Array<LoanApplication>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getAttendance(employeeId: bigint): Promise<Array<Attendance>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDSAConnectors(): Promise<Array<DSAConnector>>;
    getDSAPartners(): Promise<Array<DSAPartner>>;
    getDepartments(): Promise<Array<string>>;
    getEmployee(id: bigint): Promise<Employee>;
    getEmployeeLocations(employeeId: bigint): Promise<Array<Location>>;
    getJoiningLetters(employeeId: bigint): Promise<Array<JoiningLetter>>;
    getLoanApplication(id: bigint): Promise<LoanApplication>;
    getOfferLetters(employeeId: bigint): Promise<Array<OfferLetter>>;
    getSalarySlips(employeeId: bigint): Promise<Array<SalarySlip>>;
    getTransaction(id: bigint): Promise<Transaction>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordAttendance(employeeId: bigint, date: string, status: AttendanceStatus): Promise<void>;
    recordLocation(employeeId: bigint, latitude: number, longitude: number, note: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedData(): Promise<void>;
}
