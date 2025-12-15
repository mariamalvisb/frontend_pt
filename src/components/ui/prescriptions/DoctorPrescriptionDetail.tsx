"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/ui/PageContainer";

import { getPrescription } from "@/lib/prescriptions";

import type { Prescription, PrescriptionItem } from "@/types";

type Props = {
  id: string;
};

function statusLabel(status?: string) {
  if (!status) return "—";
  if (status === "consumed") return "Consumida";
  if (status === "pending") return "Pendiente";
  return status;
}

export default function DoctorPrescriptionDetail({ id }: Props) {
  const router = useRouter();

  const [p, setP] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPrescription(id);
        if (!alive) return;
        setP(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "No se pudo cargar la prescripción.");
        setP(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const title = p?.code ? `Prescripción ${p.code}` : "Detalle de prescripción";
  const subtitle = "Información general e ítems formulados.";

  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-start justify-end gap-2 sm:pt-0.5">
            <div className="w-fit">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/doctor/prescriptions")}
                disabled={loading}
              >
                Volver
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <div className="text-sm text-gray-600">Cargando...</div>
          ) : !p ? (
            <div className="text-sm text-gray-600">
              No hay datos para mostrar.
            </div>
          ) : (
            <>
              <div className="rounded-lg border p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Código
                    </div>
                    <div className="mt-1 text-sm">{p.code ?? "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Estado
                    </div>
                    <div className="mt-1 text-sm">{statusLabel(p.status)}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Patient ID
                    </div>
                    <div className="mt-1 text-sm">
                      {(p as any).patientId ?? (p as any).patient?.id ?? "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Doctor ID
                    </div>
                    <div className="mt-1 text-sm">
                      {(p as any).authorId ?? (p as any).author?.id ?? "—"}
                    </div>
                  </div>
                </div>

                {p.notes ? (
                  <div className="mt-4">
                    <div className="text-xs font-medium text-gray-500">
                      Notas
                    </div>
                    <div className="mt-1 text-sm">{p.notes}</div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border">
                <div className="grid grid-cols-4 gap-0 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
                  <div>Nombre</div>
                  <div>Dosis</div>
                  <div>Cantidad</div>
                  <div>Instrucciones</div>
                </div>

                {((p.items as any[]) ?? []).length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600">
                    Sin ítems.
                  </div>
                ) : (
                  (p.items as PrescriptionItem[]).map(
                    (it: PrescriptionItem, idx: number) => (
                      <div
                        key={it.id ?? `${it.name}-${idx}`}
                        className="grid grid-cols-4 gap-0 border-t px-4 py-3 text-sm"
                      >
                        <div className="truncate">{it.name ?? "—"}</div>
                        <div className="truncate">{it.dosage ?? "—"}</div>
                        <div>{it.quantity ?? "—"}</div>
                        <div className="truncate">{it.instructions ?? "—"}</div>
                      </div>
                    )
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
