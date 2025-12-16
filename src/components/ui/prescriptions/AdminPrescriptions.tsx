"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Prescription, PrescriptionStatus } from "@/types";

import { listAdminPrescriptions } from "@/lib/prescriptions";
import { Alert } from "@/components/ui/Alert";
import { PageContainer } from "@/components/ui/PageContainer";
import { PrescriptionsCard } from "./PrescriptionsCard";
import { LogoutButton } from "../LogoutButton";

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Filters = {
  status: "" | PrescriptionStatus;
  doctorId: string;
  patientId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
};

const emptyFilters: Filters = {
  status: "",
  doctorId: "",
  patientId: "",
  from: "",
  to: "",
};

export default function AdminPrescriptions() {
  const router = useRouter();

  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [limit, setLimit] = useState(10);

  const [applied, setApplied] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<Prescription[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      status: applied.status || undefined,
      doctorId: applied.doctorId.trim() || undefined,
      patientId: applied.patientId.trim() || undefined,
      from: applied.from || undefined,
      to: applied.to || undefined,
      page,
      limit,
    }),
    [applied, page, limit]
  );

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await listAdminPrescriptions(query);
        if (!alive) return;

        setItems(res.data ?? []);
        setMeta(res.meta ?? null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "No se pudieron cargar las prescripciones");
        setItems([]);
        setMeta(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [query]);

  const canPrev = (meta?.page ?? page) > 1;
  const canNext = (meta?.page ?? page) < (meta?.totalPages ?? page);

  function applyFilters() {
    setPage(1);
    setApplied(draft);
  }

  function clearFilters() {
    setPage(1);
    setDraft(emptyFilters);
    setApplied(emptyFilters);
    setLimit(10);
  }

  function statusLabel(s?: string) {
    if (!s) return "—";
    if (s === "pending") return "Pendiente";
    if (s === "consumed") return "Consumida";
    return s;
  }

  function doctorName(p: Prescription) {
    const anyP = p as any;
    return (
      anyP.author?.user?.name ||
      anyP.doctor?.user?.name ||
      anyP.author?.user?.email ||
      "—"
    );
  }

  function patientName(p: Prescription) {
    const anyP = p as any;
    return (
      anyP.patient?.user?.name ||
      anyP.patient?.user?.email ||
      anyP.patientId ||
      "—"
    );
  }

  function createdAtLabel(p: Prescription) {
    const anyP = p as any;
    const raw = anyP.createdAt;
    if (!raw) return "—";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleString("es-ES");
  }

  return (
    <PageContainer>
      <PrescriptionsCard
        title="Prescripciones (Admin)"
        subtitle="Consulta global con filtros por estado, doctor, paciente y fechas."
      >
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            {meta ? (
              <>
                Total: <span className="font-medium">{meta.total}</span> ·
                Página <span className="font-medium">{meta.page}</span> /{" "}
                <span className="font-medium">{meta.totalPages}</span>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
              onClick={() => router.push("/admin/users/new")}
              disabled={loading}
            >
              Crear usuario
            </button>

            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
              onClick={applyFilters}
              disabled={loading}
            >
              Aplicar filtros
            </button>

            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
              onClick={clearFilters}
              disabled={loading}
            >
              Limpiar
            </button>

            <LogoutButton />
          </div>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={draft.status}
              onChange={(e) =>
                setDraft((s) => ({ ...s, status: e.target.value as any }))
              }
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="consumed">Consumida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Doctor ID (opcional)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={draft.doctorId}
              onChange={(e) =>
                setDraft((s) => ({ ...s, doctorId: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              placeholder="Ej: cmj7..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Patient ID (opcional)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={draft.patientId}
              onChange={(e) =>
                setDraft((s) => ({ ...s, patientId: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              placeholder="Ej: cmj7..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Desde
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              type="date"
              value={draft.from}
              onChange={(e) =>
                setDraft((s) => ({ ...s, from: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hasta
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              type="date"
              value={draft.to}
              onChange={(e) => setDraft((s) => ({ ...s, to: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Límite
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value));
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Código</th>
                <th className="px-4 py-3 font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 font-medium text-gray-700">Doctor</th>
                <th className="px-4 py-3 font-medium text-gray-700">
                  Paciente
                </th>
                <th className="px-4 py-3 font-medium text-gray-700">Fecha</th>
                <th className="px-4 py-3 font-medium text-gray-700">Acción</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={6}>
                    Cargando…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={6}>
                    No hay prescripciones para mostrar.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{(p as any).code ?? "—"}</td>
                    <td className="px-4 py-3">
                      {statusLabel((p as any).status)}
                    </td>
                    <td className="px-4 py-3">{doctorName(p)}</td>
                    <td className="px-4 py-3">{patientName(p)}</td>
                    <td className="px-4 py-3">{createdAtLabel(p)}</td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-md border px-3 py-2 text-sm"
                        onClick={() =>
                          router.push(`/admin/prescriptions/${p.id}`)
                        }
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>

          <button
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      </PrescriptionsCard>
    </PageContainer>
  );
}
