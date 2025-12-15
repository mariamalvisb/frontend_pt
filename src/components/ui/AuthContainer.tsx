import type { ReactNode } from "react";

export function AuthContainer({ children }: { children: ReactNode }) {
  return <main className="auth-container">{children}</main>;
}
