import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types";

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
  role: Role; // "doctor" | "patient" | "admin" (pero acá usaremos doctor/patient)
  specialty?: string;
  birthDate?: string; // YYYY-MM-DD
};

export type RegisterResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    specialty?: string | null;
    birthDate?: string | null;
  };
};

export async function registerUser(payload: RegisterPayload) {
  const token = useAuthStore.getState().accessToken;

  // Solo mandamos specialty/birthDate si el usuario los llenó (evita validaciones por string vacío)
  const body: any = {
    email: payload.email,
    password: payload.password,
    name: payload.name,
    role: payload.role,
    ...(payload.specialty ? { specialty: payload.specialty } : {}),
    ...(payload.birthDate ? { birthDate: payload.birthDate } : {}),
  };

  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    accessToken: token, // si tu backend no lo requiere, igual no estorba
    body: JSON.stringify(body),
  });
}
