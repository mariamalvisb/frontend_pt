// src/app/admin/page.tsx
import { Suspense } from "react";
import { connection } from "next/server";

export default async function AdminPage() {
  // hace la ruta dinámica (evita prerender)
  await connection();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-gray-600">
          Cargando…
        </div>
      }
    >
      {/* TU CONTENIDO ACTUAL DE /admin (donde usas RequireAuth) */}
    </Suspense>
  );
}
