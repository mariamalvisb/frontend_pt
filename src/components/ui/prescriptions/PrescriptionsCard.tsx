import type { ReactNode } from "react";

export function PrescriptionsCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-xl bg-white p-6 shadow">
      <header>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        ) : null}
      </header>

      <div className="mt-6">{children}</div>
    </section>
  );
}
