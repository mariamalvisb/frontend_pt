"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { LogoutButton } from "../ui/LogoutButton";
import { getAdminQuickMetrics } from "@/lib/admin-metrics";

export default function AdminHome() {
  const router = useRouter();

  const [metrics, setMetrics] = useState<{
    patients: number;
    doctors: number;
    prescriptions: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const m = await getAdminQuickMetrics();
      setMetrics(m);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar las métricas");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PageContainer>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Panel Admin</h1>
            <p className="text-sm text-gray-600">
              Métricas rápidas y accesos a gestión.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Cargando…" : "Refrescar"}
            </button>

            <LogoutButton />
          </div>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        {/* Métricas */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Pacientes</div>
            <div className="mt-1 text-2xl font-semibold">
              {loading ? "…" : metrics?.patients ?? "—"}
            </div>
          </div>

          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Doctores</div>
            <div className="mt-1 text-2xl font-semibold">
              {loading ? "…" : metrics?.doctors ?? "—"}
            </div>
          </div>

          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Prescripciones</div>
            <div className="mt-1 text-2xl font-semibold">
              {loading ? "…" : metrics?.prescriptions ?? "—"}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            className="rounded-lg border px-4 py-3 text-left hover:bg-gray-50"
            onClick={() => router.push("/admin/prescriptions/metrics")}
            type="button"
          >
            <div className="text-sm font-semibold text-gray-900">
              Prescripciones
            </div>
            <div className="text-xs text-gray-600">Por estado y por día</div>
          </button>

          <button
            className="rounded-lg border px-4 py-3 text-left hover:bg-gray-50"
            onClick={() => router.push("/admin/doctors")}
            type="button"
          >
            <div className="text-sm font-semibold text-gray-900">Doctores</div>
            <div className="text-xs text-gray-600">GET /doctor</div>
          </button>

          <button
            className="rounded-lg border px-4 py-3 text-left hover:bg-gray-50"
            onClick={() => router.push("/admin/patients")}
            type="button"
          >
            <div className="text-sm font-semibold text-gray-900">Pacientes</div>
            <div className="text-xs text-gray-600">GET /patients</div>
          </button>

          <button
            className="rounded-lg border px-4 py-3 text-left hover:bg-gray-50"
            onClick={() => router.push("/admin/users/new")}
            type="button"
          >
            <div className="text-sm font-semibold text-gray-900">
              Crear usuario
            </div>
            <div className="text-xs text-gray-600">POST /auth/register</div>
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
