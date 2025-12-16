"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Prescription, PrescriptionStatus } from "@/types";
import { listDoctorPrescriptions } from "@/lib/prescriptions";
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

type Order = "" | "asc" | "desc";

function statusLabel(s?: PrescriptionStatus | string) {
  if (!s) return "—";
  if (s === "pending") return "Pendiente";
  if (s === "consumed") return "Consumida";
  return String(s);
}

function createdAtLabel(p: Prescription) {
  const anyP = p as any;
  const raw = anyP?.createdAt;
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString("es-ES");
}

export default function DoctorPrescriptions() {
  const router = useRouter();

  const [status, setStatus] = useState<"" | PrescriptionStatus>("");
  const [order, setOrder] = useState<Order>("");
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
      from: from || undefined,
      to: to || undefined,
      order: order || undefined,
      page,
      limit,
    }),
    [status, from, to, order, page, limit]
  );

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await listDoctorPrescriptions(query);
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
        title="Prescripciones"
        subtitle="Listado de prescripciones asociadas a tu usuario (Doctor)."
      >
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => router.push("/doctor/prescriptions/new")}
          >
            Nueva
          </button>
          <LogoutButton />
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <div className="mt-3 text-sm text-gray-600">
          {meta ? (
            <>
              Total: <span className="font-medium">{meta.total}</span> · Página{" "}
              <span className="font-medium">{meta.page}</span> /{" "}
              <span className="font-medium">{meta.totalPages}</span>
            </>
          ) : null}
        </div>

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
              Desde
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              type="date"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hasta
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              type="date"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Orden
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={order}
              onChange={(e) => {
                setPage(1);
                setOrder(e.target.value as any);
              }}
            >
              <option value="">(default)</option>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
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

        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Código</th>
                <th className="px-4 py-3 font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 font-medium text-gray-700">Fecha</th>
                <th className="px-4 py-3 font-medium text-gray-700">Acción</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={4}>
                    Cargando…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-600" colSpan={4}>
                    No hay prescripciones para mostrar.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{p.code ?? "—"}</td>
                    <td className="px-4 py-3">{statusLabel(p.status)}</td>
                    <td className="px-4 py-3">{createdAtLabel(p)}</td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-md border px-3 py-2 text-sm"
                        onClick={() =>
                          router.push(`/doctor/prescriptions/${p.id}`)
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
