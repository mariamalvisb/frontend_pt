import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";

export type Patient = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export type PatientsMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function unwrapPatientsResponse(res: any) {
  // Soporta:
  // - { data: [...], meta: {...} }
  // - { data: { data: [...], meta: {...} } }
  // - { statusCode, ..., data: { data: [...], meta: {...} } }  (TransformInterceptor)
  const payload = res?.data?.data ? res.data : res?.data ? res : res;
  const data = payload?.data ?? payload?.data?.data ?? payload ?? [];
  const meta = payload?.meta ?? payload?.data?.meta ?? null;

  return { data, meta };
}

function normalizePatient(p: any): Patient {
  const id = p?.id ?? p?.patientId ?? "";

  // Algunos backends devuelven:
  // p.user.name / p.user.email
  // o p.userId, etc.
  const name =
    p?.user?.name ??
    p?.user?.displayName ??
    p?.name ??
    p?.fullName ??
    "Sin nombre";

  const email = p?.user?.email ?? p?.email ?? "";

  return {
    id: String(id),
    name: String(name),
    email: String(email),
    createdAt: p?.createdAt ? String(p.createdAt) : undefined,
  };
}

export async function listPatients(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ data: Patient[]; meta: PatientsMeta }> {
  const token = useAuthStore.getState().accessToken;

  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.search) sp.set("search", params.search);

  const qs = sp.toString();

  const res = await apiFetch<any>(`/patients${qs ? `?${qs}` : ""}`, {
    method: "GET",
    accessToken: token,
  });

  const { data: rawData, meta: rawMeta } = unwrapPatientsResponse(res);

  const arr = Array.isArray(rawData) ? rawData : [];
  const data = arr.map(normalizePatient).filter((p) => p.id);

  const meta: PatientsMeta = rawMeta ?? {
    total: data.length,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    totalPages: 1,
  };

  return { data, meta };
}
