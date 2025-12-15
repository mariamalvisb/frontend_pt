import type { ReactNode } from "react";

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
      {children}
    </div>
  );
}
