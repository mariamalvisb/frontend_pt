"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/ui/PageContainer";
import { useToast } from "@/components/ui/ToastProvider";

import { getPrescription, downloadPrescriptionPdf } from "@/lib/prescriptions";

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

function dateLabel(raw?: any) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString("es-ES");
}

function unwrapPrescription(payload: any): Prescription {
  // Soporta respuestas tipo: data, {data: {...}}, {data: {data: {...}}}
  return (payload?.data?.data ?? payload?.data ?? payload) as Prescription;
}

export default function AdminPrescriptionDetail({ id }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [p, setP] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [busyPdf, setBusyPdf] = useState(false);

  const doctorName = useMemo(() => {
    const anyP = p as any;
    return (
      anyP?.author?.user?.name ||
      anyP?.doctor?.user?.name ||
      anyP?.author?.user?.email ||
      "—"
    );
  }, [p]);

  const patientName = useMemo(() => {
    const anyP = p as any;
    return anyP?.patient?.user?.name || anyP?.patient?.user?.email || "—";
  }, [p]);

  const doctorId = useMemo(() => {
    const anyP = p as any;
    return anyP?.authorId ?? anyP?.author?.id ?? "—";
  }, [p]);

  const patientId = useMemo(() => {
    const anyP = p as any;
    return anyP?.patientId ?? anyP?.patient?.id ?? "—";
  }, [p]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getPrescription(id);
        if (!alive) return;
        const data = unwrapPrescription(res);
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

  async function onDownloadPdf() {
    if (!p) return;

    setBusyPdf(true);
    setError(null);
    try {
      const prescId = (p as any).id ?? id;
      const blob = await downloadPrescriptionPdf(prescId);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `prescripcion-${(p as any).code || prescId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      toast.success("PDF descargado correctamente.", "Descarga");
    } catch (e: any) {
      const msg = e?.message || "No se pudo descargar el PDF.";
      setError(msg);
      toast.error(msg, "Error");
    } finally {
      setBusyPdf(false);
    }
  }

  const title = p?.code ? `Prescripción ${p.code} (Admin)` : "Detalle (Admin)";
  const subtitle = "Vista global: datos, ítems y descarga PDF.";

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
                onClick={() => router.push("/admin/prescriptions")}
                disabled={loading}
              >
                Volver
              </Button>
            </div>

            <div className="w-fit">
              <Button
                type="button"
                onClick={onDownloadPdf}
                disabled={loading || !p || busyPdf}
              >
                {busyPdf ? "Descargando..." : "Descargar PDF"}
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
                      Fecha creación
                    </div>
                    <div className="mt-1 text-sm">
                      {dateLabel((p as any).createdAt)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Fecha consumo
                    </div>
                    <div className="mt-1 text-sm">
                      {dateLabel((p as any).consumedAt)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Doctor
                    </div>
                    <div className="mt-1 text-sm">{doctorName}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Doctor ID
                    </div>
                    <div className="mt-1 text-sm">{doctorId}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Paciente
                    </div>
                    <div className="mt-1 text-sm">{patientName}</div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Patient ID
                    </div>
                    <div className="mt-1 text-sm">{patientId}</div>
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

                {(p.items ?? []).length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600">
                    Sin ítems.
                  </div>
                ) : (
                  (p.items as PrescriptionItem[]).map((it, idx) => (
                    <div
                      key={(it as any).id ?? `${it.name}-${idx}`}
                      className="grid grid-cols-4 gap-0 border-t px-4 py-3 text-sm"
                    >
                      <div className="truncate">{it.name ?? "—"}</div>
                      <div className="truncate">{it.dosage ?? "—"}</div>
                      <div>{it.quantity ?? "—"}</div>
                      <div className="truncate">{it.instructions ?? "—"}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
