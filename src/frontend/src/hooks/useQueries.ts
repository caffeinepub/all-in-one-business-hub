import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AttendanceStatus } from "../backend.d";
import type {
  DSAConnector,
  DSAPartner,
  Employee,
  LoanApplication,
  Transaction,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDepartments() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDepartments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllLoanApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<LoanApplication[]>({
    queryKey: ["loans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLoanApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      department: string;
      role: string;
      salary: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addEmployee(
        data.name,
        data.email,
        data.department,
        data.role,
        data.salary,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useApplyForLoan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      applicantName: string;
      loanType: string;
      amount: number;
      agentName: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.applyForLoan(
        data.applicantName,
        data.loanType,
        data.amount,
        data.agentName,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      category: string;
      description: string;
      transactionType: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTransaction(
        data.amount,
        data.category,
        data.description,
        data.transactionType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useRecordAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      date: string;
      status: AttendanceStatus;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordAttendance(data.employeeId, data.date, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useRecordLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      latitude: number;
      longitude: number;
      note: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordLocation(
        data.employeeId,
        data.latitude,
        data.longitude,
        data.note,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useGetDSAPartners() {
  const { actor, isFetching } = useActor();
  return useQuery<DSAPartner[]>({
    queryKey: ["dsa-partners"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDSAPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDSAConnectors() {
  const { actor, isFetching } = useActor();
  return useQuery<DSAConnector[]>({
    queryKey: ["dsa-connectors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDSAConnectors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDSAPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      contactPerson: string;
      phone: string;
      region: string;
      commissionPercentage: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addDSAPartner(
        data.name,
        data.contactPerson,
        data.phone,
        data.region,
        data.commissionPercentage,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dsa-partners"] });
    },
  });
}

export function useAddDSAConnector() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      email: string;
      partnerName: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addDSAConnector(
        data.name,
        data.phone,
        data.email,
        data.partnerName,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dsa-connectors"] });
    },
  });
}

export function useGenerateOfferLetter() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: { employeeId: bigint; content: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.generateOfferLetter(data.employeeId, data.content);
    },
  });
}

export function useGenerateJoiningLetter() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: { employeeId: bigint; content: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.generateJoiningLetter(data.employeeId, data.content);
    },
  });
}

export function useGenerateSalarySlip() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      employeeId: bigint;
      month: string;
      year: bigint;
      content: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.generateSalarySlip(
        data.employeeId,
        data.month,
        data.year,
        data.content,
      );
    },
  });
}

export { AttendanceStatus };
