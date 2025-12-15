import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return <main className="min-h-screen px-4 py-6">{children}</main>;
}
