"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listPatients } from "@/lib/patients";
import { PageContainer } from "@/components/ui/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { LogoutButton } from "../ui/LogoutButton";

export default function AdminPatients() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [patients, setPatients] = useState<any[]>([]);
  const [meta, setMeta] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await listPatients({
          page,
          limit,
          search: search.trim() || undefined,
        });

        if (!alive) return;

        setPatients(res.data ?? []);
        setMeta(res.meta ?? null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "No se pudieron cargar los pacientes");
        setPatients([]);
        setMeta(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [page, limit, search]);

  const canPrev = (meta?.page ?? page) > 1;
  const canNext = (meta?.page ?? page) < (meta?.totalPages ?? page);

  return (
    <PageContainer>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Pacientes</h1>
            <p className="text-sm text-gray-600">
              Filtra pacientes por nombre (search).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm"
              onClick={() => router.push("/admin")}
            >
              Volver
            </button>

            <LogoutButton />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-md border px-3 py-2 text-sm"
            placeholder="Buscar por nombre"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

          <select
            className="rounded-md border px-3 py-2 text-sm"
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

        {error ? <Alert>{error}</Alert> : null}

        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 font-medium text-gray-700">Nombre</th>
                <th className="px-4 py-3 font-medium text-gray-700">Email</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-600">
                    Cargando…
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-600">
                    No hay pacientes para mostrar.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3">{p.name || "—"}</td>
                    <td className="px-4 py-3">{p.email || "—"}</td>
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
      </div>
    </PageContainer>
  );
}
