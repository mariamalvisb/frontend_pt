import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";
import type {
  ListResult,
  Prescription,
  PrescriptionStatus,
  PrescriptionItem,
} from "@/types";

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
 * DOCTOR: listar propias prescripciones
 * GET /prescriptions?mine=true&status&from&to&page&limit
 */
export async function listDoctorPrescriptions(params: {
  status?: PrescriptionStatus;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}) {
  const token = getToken();
  const q = buildQS({ mine: true, ...params });

  return apiFetch<ListResult<Prescription>>(`/prescriptions?${q}`, {
    method: "GET",
    accessToken: token,
  });
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

  return apiFetch<ListResult<Prescription>>(`/prescriptions/me?${q}`, {
    method: "GET",
    accessToken: token,
  });
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

  return apiFetch<ListResult<Prescription>>(`/prescriptions/admin?${q}`, {
    method: "GET",
    accessToken: token,
  });
}

/**
 * Detalle (si existe en tu API)
 * GET /prescriptions/:id
 */
export async function getPrescription(id: string) {
  const token = getToken();

  return apiFetch<Prescription>(`/prescriptions/${id}`, {
    method: "GET",
    accessToken: token,
  });
}

/**
 * DOCTOR: crear prescripción (si existe en tu API)
 * POST /prescriptions
 */
export async function createPrescription(input: {
  patientId: string;
  items: PrescriptionItem[];
  notes?: string;
}) {
  const token = getToken();

  return apiFetch<Prescription>("/prescriptions", {
    method: "POST",
    accessToken: token,
    body: JSON.stringify(input),
  });
}

/**
 * PATIENT: consumir (si existe en tu API)
 * PUT /prescriptions/:id/consume
 */
export async function consumePrescription(id: string) {
  const token = getToken();

  return apiFetch<{ ok: boolean }>(`/prescriptions/${id}/consume`, {
    method: "PUT",
    accessToken: token,
  });
}

/**
 * PATIENT: descargar PDF (si existe en tu API)
 * GET /prescriptions/:id/pdf
 */
export async function downloadPrescriptionPdf(id: string) {
  const token = getToken();

  return apiFetch<Blob>(`/prescriptions/${id}/pdf`, {
    method: "GET",
    accessToken: token,
    responseType: "blob",
  });
}
