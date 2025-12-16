"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Prescription, PrescriptionStatus } from "@/types";

import { listAdminPrescriptions } from "@/lib/prescriptions";
import { Alert } from "@/components/ui/Alert";
import { PageContainer } from "@/components/ui/PageContainer";
import { PrescriptionsCard } from "./PrescriptionsCard";
import { LogoutButton } from "../LogouButton";

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function AdminPrescriptions() {
  const router = useRouter();

  const [status, setStatus] = useState<"" | PrescriptionStatus>("");
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState(""); // YYYY-MM-DD

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState<Prescription[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      status: status || undefined,
      doctorId: doctorId.trim() || undefined,
      patientId: patientId.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit,
    }),
    [status, doctorId, patientId, from, to, page, limit]
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
        <div className="mt-2 flex items-center justify-end">
          <LogoutButton />
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as any);
              }}
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
              value={doctorId}
              onChange={(e) => {
                setPage(1);
                setDoctorId(e.target.value);
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
              value={patientId}
              onChange={(e) => {
                setPage(1);
                setPatientId(e.target.value);
              }}
              placeholder="Ej: cmj7..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Desde (YYYY-MM-DD)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
              placeholder="2025-12-01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hasta (YYYY-MM-DD)
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
              placeholder="2025-12-31"
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

        <div className="mt-3 text-sm text-gray-600">
          {meta ? (
            <>
              Total: <span className="font-medium">{meta.total}</span> · Página{" "}
              <span className="font-medium">{meta.page}</span> /{" "}
              <span className="font-medium">{meta.totalPages}</span>
            </>
          ) : null}
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
