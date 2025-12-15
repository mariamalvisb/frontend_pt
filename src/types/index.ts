export type Role = "admin" | "doctor" | "patient";
export * from "./prescription";

export interface AuthProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
}
