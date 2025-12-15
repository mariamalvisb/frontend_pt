import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";
import type { ListResult } from "@/types";

export type UserListItem = {
  id: string;
  email: string;
  name: string;
  role: "doctor" | "patient" | "admin";
};

function getToken() {
  const token = useAuthStore.getState().accessToken;
  if (!token) throw new Error("No hay accessToken. Inicia sesión nuevamente.");
  return token;
}

function buildQS(params: Record<string, any>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  return qs.toString();
}

/**
 * GET /users?role=doctor|patient&query=&page&limit
 */
export async function listUsers(params: {
  role?: UserListItem["role"];
  query?: string;
  page?: number;
  limit?: number;
}) {
  const token = getToken();
  const q = buildQS(params);

  return apiFetch<ListResult<UserListItem>>(`/users?${q}`, {
    method: "GET",
    accessToken: token,
  });
}
