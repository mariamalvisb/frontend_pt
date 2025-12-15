"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/ui/PageContainer";
import { PrescriptionsCard } from "./PrescriptionsCard";

import {
  getPrescription,
  consumePrescription,
  downloadPrescriptionPdf,
} from "@/lib/prescriptions";

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

export default function PatientPrescriptionDetail({ id }: Props) {
  const router = useRouter();

  const [p, setP] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [busyConsume, setBusyConsume] = useState(false);
  const [busyPdf, setBusyPdf] = useState(false);

  const isConsumed = useMemo(() => p?.status === "consumed", [p?.status]);

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

  async function onConsume() {
    if (!p) return;

    setBusyConsume(true);
    setError(null);
    try {
      const updated = await consumePrescription(p.id); // ✅ 1 argumento
      setP(updated);
    } catch (e: any) {
      setError(e?.message || "No se pudo marcar como consumida.");
    } finally {
      setBusyConsume(false);
    }
  }

  async function onDownloadPdf() {
    if (!p) return;

    setBusyPdf(true);
    setError(null);
    try {
      const blob = await downloadPrescriptionPdf(p.id); // ✅ 1 argumento
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `prescripcion-${p.code || p.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || "No se pudo descargar el PDF.");
    } finally {
      setBusyPdf(false);
    }
  }

  return (
    <PageContainer>
      <PrescriptionsCard
        title={p?.code ? `Prescripción ${p.code}` : "Detalle de prescripción"}
        subtitle="Información general e ítems formulados."
      >
        {error ? <Alert>{error}</Alert> : null}

        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Volver
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onDownloadPdf}
              disabled={loading || !p || busyPdf}
            >
              {busyPdf ? "Descargando..." : "Descargar PDF"}
            </Button>

            <Button
              type="button"
              onClick={onConsume}
              disabled={loading || !p || busyConsume || isConsumed}
            >
              {isConsumed
                ? "Consumida"
                : busyConsume
                ? "Marcando..."
                : "Consumir"}
            </Button>
          </div>
        </div>

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
                    {p.patientId ?? p.patient?.id ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Doctor ID
                  </div>
                  <div className="mt-1 text-sm">
                    {p.authorId ?? p.author?.id ?? "—"}
                  </div>
                </div>
              </div>

              {p.notes ? (
                <div className="mt-4">
                  <div className="text-xs font-medium text-gray-500">Notas</div>
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

              {(p.items ?? []).length === 0 ? (
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
      </PrescriptionsCard>
    </PageContainer>
  );
}
