import type { ReactNode } from "react";

export function AuthContainer({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      {children}
    </main>
  );
}
