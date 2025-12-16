import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";

export type Doctor = {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  createdAt?: string;
};

export type DoctorsMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function listDoctors(params: {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
}): Promise<{ data: Doctor[]; meta: DoctorsMeta }> {
  const token = useAuthStore.getState().accessToken;

  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.search) sp.set("search", params.search);
  if (params.specialty) sp.set("specialty", params.specialty);

  const qs = sp.toString();

  const res = await apiFetch<any>(`/doctor${qs ? `?${qs}` : ""}`, {
    method: "GET",
    accessToken: token,
  });

  const arr = res?.data ?? (Array.isArray(res) ? res : []);
  const meta = res?.meta ?? {
    total: Array.isArray(arr) ? arr.length : 0,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    totalPages: 1,
  };

  return { data: arr, meta };
}
