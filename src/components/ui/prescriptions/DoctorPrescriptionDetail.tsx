"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPrescription } from "@/lib/prescriptions";
import { Alert } from "@/components/ui/Alert";
import { PageContainer } from "@/components/ui/PageContainer";
import { PrescriptionsCard } from "@/components/ui/prescriptions/PrescriptionsCard";

type AnyObj = Record<string, any>;

function normalizePrescription(res: any): AnyObj {
  // por si tu apiFetch devuelve { data: ... } o devuelve directo
  return (
    (res && typeof res === "object" && "data" in res ? res.data : res) ?? {}
  );
}

function statusLabel(status?: string) {
  if (status === "pending") return "Pendiente";
  if (status === "consumed") return "Consumida";
  return status ?? "—";
}

export default function DoctorPrescriptionDetail({ id }: { id: string }) {
  const [p, setP] = useState<AnyObj | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => {
    const src = p ?? {};
    return (src.items ??
      src.prescriptionItems ??
      src.lineItems ??
      src.details ??
      []) as AnyObj[];
  }, [p]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await getPrescription(id);
        if (!mounted) return;
        setP(normalizePrescription(res));
      } catch (e: any) {
        if (!mounted) return;
        setError(
          e?.message || "No se pudo cargar el detalle de la prescripción"
        );
        setP(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <PageContainer>
      <PrescriptionsCard
        title={p?.code ? `Prescripción ${p.code}` : "Detalle de prescripción"}
        subtitle="Información general e ítems formulados."
      >
        <div className="flex items-center justify-between gap-3">
          <Link href="/doctor/prescriptions" className="btn btn-secondary">
            Volver
          </Link>

          <div className="text-sm text-gray-600">
            ID: <span className="font-medium">{id}</span>
          </div>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        {loading ? (
          <div className="mt-4 text-sm text-gray-600">Cargando…</div>
        ) : !p ? (
          <div className="mt-4 text-sm text-gray-600">
            No hay datos para mostrar.
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-gray-500">Código</div>
                <div className="mt-1 text-sm font-semibold">
                  {p.code ?? "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-500">Estado</div>
                <div className="mt-1 text-sm font-semibold">
                  {statusLabel(p.status)}
                </div>
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
                  {p.authorId ??
                    p.author?.id ??
                    p.doctorId ??
                    p.doctor?.id ??
                    "—"}
                </div>
              </div>

              {p.notes ? (
                <div className="sm:col-span-2">
                  <div className="text-xs font-medium text-gray-500">Notas</div>
                  <div className="mt-1 text-sm">{p.notes}</div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-700">
                      Nombre
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-700">
                      Dosis
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-700">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-700">
                      Instrucciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-gray-600" colSpan={4}>
                        No hay ítems para mostrar.
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => (
                      <tr
                        key={it.id ?? `${it.name ?? "item"}-${idx}`}
                        className="border-t"
                      >
                        <td className="px-4 py-3">{it.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          {it.dosage ?? it.dose ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {typeof it.quantity === "number" ||
                          typeof it.quantity === "string"
                            ? it.quantity
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {it.instructions ?? it.indications ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </PrescriptionsCard>
    </PageContainer>
  );
}
