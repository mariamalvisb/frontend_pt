"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageContainer } from "@/components/ui/PageContainer";
import { PrescriptionsCard } from "./PrescriptionsCard";

import { createPrescriptionFromAudio } from "@/lib/prescriptions";

export default function DoctorPrescriptionNewAudio() {
  const router = useRouter();

  const [patientId, setPatientId] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);

    const pid = patientId.trim();
    if (!pid) {
      setError("El patientId es obligatorio.");
      return;
    }

    if (!audioFile) {
      setError("Debes seleccionar un archivo de audio.");
      return;
    }

    setLoading(true);
    try {
      const created = await createPrescriptionFromAudio({
        patientId: pid,
        audioFile,
      });

      const createdId =
        (created as any)?.id ??
        (created as any)?.data?.id ??
        (created as any)?.data?.data?.id;

      if (!createdId) {
        throw new Error(
          "La API no devolvió un id de prescripción (revisa si viene envuelto en data)."
        );
      }

      router.push(`/doctor/prescriptions/${createdId}`);
    } catch (e: any) {
      setError(e?.message || "No se pudo crear la prescripción desde audio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <PrescriptionsCard
        title="Nueva prescripción (audio)"
        subtitle="Sube un audio y el sistema generará la prescripción automáticamente."
      >
        {error ? <Alert>{error}</Alert> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Patient ID *"
            value={patientId}
            onChange={(value) => setPatientId(value)}
            placeholder="Ej: cmj7..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Audio *
            </label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              type="file"
              accept="audio/*,.mp3,.ogg,.wav,.webm,.m4a"
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            />
            <div className="mt-1 text-xs text-gray-500">
              Formatos sugeridos: mp3, ogg, wav, webm, m4a
              {audioFile ? ` · Seleccionado: ${audioFile.name}` : ""}
            </div>
          </div>
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
            {loading ? "Procesando..." : "Crear desde audio"}
          </Button>
        </div>
      </PrescriptionsCard>
    </PageContainer>
  );
}
