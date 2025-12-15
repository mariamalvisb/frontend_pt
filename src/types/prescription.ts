export type PrescriptionStatus = "pending" | "consumed";

export interface PrescriptionItem {
  id?: string;
  name: string;
  dosage?: string | null;
  quantity?: number | null;
  instructions?: string | null;
}

export interface Prescription {
  id: string;
  code?: string;
  status: PrescriptionStatus;
  createdAt?: string;
  consumedAt?: string | null;
  notes?: string | null;

  // pueden venir relaciones (según implementación)
  doctor?: { id: string; name?: string; email?: string };
  patient?: { id: string; name?: string; email?: string };

  items?: PrescriptionItem[];

  // para no romper si el backend manda más campos
  [key: string]: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListResult<T> {
  data: T[];
  meta: PaginationMeta;
}
