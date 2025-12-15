"use client";

import { useEffect, useMemo, useState } from "react";
import type { Prescription, PrescriptionStatus } from "@/types";
import { listMyPrescriptions } from "@/lib/prescriptions";
import { Alert } from "@/components/ui/Alert";
import { PageContainer } from "@/components/ui/PageContainer";
import { PrescriptionsCard } from "./PrescriptionsCard";

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function PatientPrescriptions() {
  const [status, setStatus] = useState<"" | PrescriptionStatus>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState<Prescription[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
    () => ({ status: status || undefined, page, limit }),
    [status, page, limit]
  );

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await listMyPrescriptions(query);
        if (!mounted) return;

        setItems(res.data ?? []);
        setMeta(res.meta ?? null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "No se pudieron cargar las prescripciones");
        setItems([]);
        setMeta(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [query]);

  const canPrev = (meta?.page ?? page) > 1;
  const canNext = (meta?.page ?? page) < (meta?.totalPages ?? page);

  return (
    <PageContainer>
      <PrescriptionsCard
        title="Mis prescripciones"
        subtitle="Listado de prescripciones asociadas a tu usuario."
      >
        {error ? <Alert>{error}</Alert> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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

          <div className="text-sm text-gray-600">
            {meta ? (
              <>
                Total: <span className="font-medium">{meta.total}</span> ·
                Página <span className="font-medium">{meta.page}</span> /{" "}
                <span className="font-medium">{meta.totalPages}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Código</th>
                <th className="px-4 py-3 font-medium text-gray-700">Estado</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={2}>
                    Cargando…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={2}>
                    No hay prescripciones para mostrar.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{p.code ?? "—"}</td>
                    <td className="px-4 py-3">
                      {p.status === "pending" ? "Pendiente" : "Consumida"}
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
