"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { Alert } from "@/components/ui/Alert";
import { registerUser } from "@/lib/admin-users";
import type { Role } from "@/types";
import { LogoutButton } from "../ui/LogoutButton";

export default function AdminCreateUser() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Opcionales según Swagger (ejemplo trae ambos)
  const [specialty, setSpecialty] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validación mínima (sin inventar reglas)
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Completa nombre, email y contraseña.");
      return;
    }
    if (role !== "doctor" && role !== "patient") {
      setError("El rol debe ser doctor o patient.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        specialty: specialty.trim() || undefined,
        birthDate: birthDate || undefined,
      });

      // ✅ Para que puedas “probar” que quedó creado:
      // redirigimos a la lista correspondiente
      router.push(role === "doctor" ? "/admin/doctors" : "/admin/patients");
    } catch (e: any) {
      setError(e?.message || "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Crear usuario
            </h1>
            <p className="text-sm text-gray-600">
              Crea un doctor o un paciente usando{" "}
              <span className="font-mono">POST /auth/register</span>.
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

        {error ? <Alert>{error}</Alert> : null}

        <form onSubmit={onSubmit} className="mt-4 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={loading}
              >
                <option value="patient">patient</option>
                <option value="doctor">doctor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Usuario Prueba"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@test.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12345"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Especialidad (opcional)
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Medicina general"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de nacimiento (opcional)
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creando…" : "Crear usuario"}
            </button>

            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
              disabled={loading}
              onClick={() =>
                router.push(
                  role === "doctor" ? "/admin/doctors" : "/admin/patients"
                )
              }
            >
              Ver lista
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
