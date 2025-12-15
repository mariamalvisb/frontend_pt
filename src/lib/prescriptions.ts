import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";
import type {
  ListResult,
  Prescription,
  PrescriptionStatus,
  PrescriptionItem,
} from "@/types";

type ApiEnvelope<T> = {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  data: T;
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

function unwrap<T>(res: any): T {
  // Solo “desenvuelve” si parece la respuesta del TransformInterceptor
  if (
    res &&
    typeof res === "object" &&
    "statusCode" in res &&
    "timestamp" in res &&
    "path" in res &&
    "method" in res &&
    "data" in res
  ) {
    return (res as ApiEnvelope<T>).data;
  }
  return res as T;
}

/**
 * DOCTOR: listar propias prescripciones
 * GET /prescriptions?status&from&to&page&limit&order
 */
export async function listDoctorPrescriptions(params: {
  status?: PrescriptionStatus;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
}) {
  const token = getToken();
  const q = buildQS(params);

  const res = await apiFetch<any>(`/prescriptions?${q}`, {
    method: "GET",
    accessToken: token,
  });

  return unwrap<ListResult<Prescription>>(res);
}

/**
 * PATIENT: mis prescripciones
 * GET /prescriptions/me?status&page&limit
 */
export async function listMyPrescriptions(params: {
  status?: PrescriptionStatus;
  page?: number;
  limit?: number;
}) {
  const token = getToken();
  const q = buildQS(params);

  const res = await apiFetch<any>(`/prescriptions/me?${q}`, {
    method: "GET",
    accessToken: token,
  });

  return unwrap<ListResult<Prescription>>(res);
}

/**
 * ADMIN: listar con filtros
 * GET /prescriptions/admin?status&doctorId&patientId&from&to&page&limit
 */
export async function listAdminPrescriptions(params: {
  status?: PrescriptionStatus;
  doctorId?: string;
  patientId?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}) {
  const token = getToken();
  const q = buildQS(params);

  const res = await apiFetch<any>(`/prescriptions/admin?${q}`, {
    method: "GET",
    accessToken: token,
  });

  return unwrap<ListResult<Prescription>>(res);
}

/**
 * Detalle
 * GET /prescriptions/:id
 */
export async function getPrescription(id: string) {
  const token = getToken();

  const res = await apiFetch<any>(`/prescriptions/${id}`, {
    method: "GET",
    accessToken: token,
  });

  return unwrap<Prescription>(res);
}

/**
 * DOCTOR: crear prescripción
 * POST /prescriptions
 */
export async function createPrescription(input: {
  patientId: string;
  items: PrescriptionItem[];
  notes?: string;
}) {
  const token = getToken();

  const res = await apiFetch<any>("/prescriptions", {
    method: "POST",
    accessToken: token,
    body: JSON.stringify(input),
  });

  return unwrap<Prescription>(res);
}

/**
 * PATIENT: consumir
 * PUT /prescriptions/:id/consume
 */
export async function consumePrescription(id: string) {
  const token = getToken();

  const res = await apiFetch<any>(`/prescriptions/${id}/consume`, {
    method: "PUT",
    accessToken: token,
  });

  return unwrap<Prescription>(res);
}

/**
 * PATIENT/ADMIN: descargar PDF
 * GET /prescriptions/:id/pdf
 */
export async function downloadPrescriptionPdf(id: string) {
  const token = getToken();

  // Esto NO viene envuelto (es stream/pdf), no se “unwrapea”
  return apiFetch<Blob>(`/prescriptions/${id}/pdf`, {
    method: "GET",
    accessToken: token,
    responseType: "blob",
  });
}
