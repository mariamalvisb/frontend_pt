"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PrescriptionItem } from "@/types";
import { createPrescription } from "@/lib/prescriptions";

import { Alert } from "@/components/ui/Alert";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PrescriptionsCard } from "./PrescriptionsCard";
import { useToast } from "@/components/ui/ToastProvider";

type DraftItem = {
  name: string;
  dosage: string;
  quantity: string;
  instructions: string;
};

export default function DoctorPrescriptionNew() {
  const router = useRouter();
  const toast = useToast();

  // ✅ Ahora se ingresa manualmente
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<DraftItem[]>([
    { name: "", dosage: "", quantity: "1", instructions: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { name: "", dosage: "", quantity: "1", instructions: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  async function onSubmit() {
    setError(null);

    const pid = patientId.trim();
    if (!pid) {
      setError("Debes ingresar el patientId.");
      return;
    }

    const cleaned: PrescriptionItem[] = items
      .map((it) => ({
        name: it.name.trim(),
        dosage: it.dosage.trim() || undefined,
        instructions: it.instructions.trim() || undefined,
        quantity: it.quantity.trim() === "" ? undefined : Number(it.quantity),
      }))
      .filter((it) => it.name.length > 0);

    if (cleaned.length === 0) {
      setError("Agrega al menos 1 ítem con nombre.");
      return;
    }

    const badQty = cleaned.find(
      (it) =>
        it.quantity !== undefined &&
        it.quantity !== null &&
        (!Number.isFinite(it.quantity) || it.quantity <= 0)
    );
    if (badQty) {
      setError("La cantidad debe ser un número mayor a 0.");
      return;
    }

    setLoading(true);
    try {
      const created: any = await createPrescription({
        patientId: pid, // ✅ se envía el patientId ingresado
        notes: notes.trim() || undefined,
        items: cleaned,
      });

      const createdId =
        created?.data?.id ?? created?.id ?? created?.data?.data?.id;

      if (!createdId) {
        throw new Error("La API no devolvió un id de prescripción.");
      }

      toast.success("Prescripción creada correctamente.", "Creada");
      router.push(`/doctor/prescriptions/${createdId}`);
    } catch (e: any) {
      const msg = e?.message || "No se pudo crear la prescripción.";
      setError(msg);
      toast.error(msg, "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <PrescriptionsCard
        title="Nueva prescripción"
        subtitle="Crea una prescripción ingresando el patientId manualmente."
      >
        {error ? <Alert>{error}</Alert> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Patient ID *"
            value={patientId}
            onChange={(value) => setPatientId(value)}
            placeholder="Ej: clx123abc... (ID real de Patient)"
          />

          <Input
            label="Notas (opcional)"
            value={notes}
            onChange={(value) => setNotes(value)}
            placeholder="Ej: Tomar con agua"
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Ítems</h3>
          <Button type="button" onClick={addItem}>
            + Agregar ítem
          </Button>
        </div>

        <div className="mt-3 space-y-4">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-lg border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Nombre *"
                  value={it.name}
                  onChange={(value) => updateItem(idx, { name: value })}
                  placeholder="Ej: Amoxicilina"
                />

                <Input
                  label="Dosis"
                  value={it.dosage}
                  onChange={(value) => updateItem(idx, { dosage: value })}
                  placeholder="Ej: 500mg"
                />

                <Input
                  label="Cantidad"
                  type="number"
                  value={it.quantity}
                  onChange={(value) => updateItem(idx, { quantity: value })}
                  placeholder="Ej: 15"
                />

                <Input
                  label="Instrucciones"
                  value={it.instructions}
                  onChange={(value) => updateItem(idx, { instructions: value })}
                  placeholder="Ej: Después de comer"
                />
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1 || loading}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/doctor/prescriptions")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Crear"}
          </Button>
        </div>
      </PrescriptionsCard>
    </PageContainer>
  );
}
