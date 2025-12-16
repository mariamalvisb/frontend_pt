"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PrescriptionItem } from "@/types";
import { createPrescription } from "@/lib/prescriptions";
import { listPatients, type Patient } from "@/lib/patients";
import { Alert } from "@/components/ui/Alert";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PrescriptionsCard } from "./PrescriptionsCard";

type DraftItem = {
  name: string;
  dosage: string;
  quantity: string; // string para que cuadre con Input
  instructions: string;
};

export default function DoctorPrescriptionNew() {
  const router = useRouter();

  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<DraftItem[]>([
    { name: "", dosage: "", quantity: "1", instructions: "" },
  ]);

  // ✅ pacientes (para el select)
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);

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

  // ✅ cargar pacientes (con search opcional)
  useEffect(() => {
    let alive = true;

    async function run() {
      setPatientsLoading(true);
      setPatientsError(null);

      try {
        // pequeño debounce para no pegarle al endpoint en cada tecla
        await new Promise((r) => setTimeout(r, 250));
        if (!alive) return;

        const res = await listPatients({
          page: 1,
          limit: 50,
          search: patientSearch.trim() || undefined,
        });

        if (!alive) return;
        setPatients(res.data ?? []);
      } catch (e: any) {
        if (!alive) return;
        setPatients([]);
        setPatientsError(e?.message || "No se pudieron cargar los pacientes.");
      } finally {
        if (alive) setPatientsLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [patientSearch]);

  const patientOptions = useMemo(() => {
    return patients.map((p) => ({
      id: p.id,
      label: p.email ? `${p.name} — ${p.email}` : p.name,
    }));
  }, [patients]);

  async function onSubmit() {
    setError(null);

    if (!patientId.trim()) {
      setError("Debes seleccionar un paciente.");
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
        patientId: patientId.trim(),
        notes: notes.trim() || undefined,
        items: cleaned,
      });

      // soporta wrapper
      const createdId =
        created?.data?.id ?? created?.id ?? created?.data?.data?.id;

      if (!createdId) {
        throw new Error(
          "La API no devolvió un id de prescripción (revisa wrapper en data)."
        );
      }

      router.push(`/doctor/prescriptions/${createdId}`);
    } catch (e: any) {
      setError(e?.message || "No se pudo crear la prescripción.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <PrescriptionsCard
        title="Nueva prescripción"
        subtitle="Crea una prescripción manualmente agregando ítems dinámicos."
      >
        {error ? <Alert>{error}</Alert> : null}

        {/* ✅ Paciente como select + búsqueda */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paciente *
            </label>

            <div className="mt-1 grid gap-2">
              <input
                className="w-full rounded-md border px-3 py-2"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Buscar por nombre o email (opcional)"
              />

              <select
                className="w-full rounded-md border px-3 py-2 disabled:opacity-60"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={patientsLoading}
              >
                <option value="">
                  {patientsLoading
                    ? "Cargando pacientes..."
                    : "Selecciona un paciente"}
                </option>

                {patientOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>

              {patientsError ? (
                <p className="text-sm text-red-600">{patientsError}</p>
              ) : null}
            </div>
          </div>

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
                  disabled={items.length === 1}
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
