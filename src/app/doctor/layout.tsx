import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-gray-600">
          Cargando…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
