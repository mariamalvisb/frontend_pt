"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Role } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { bootstrapAuth } from "@/lib/auth";

function homeByRole(role: Role) {
  if (role === "admin") return "/admin";
  if (role === "doctor") return "/doctor/prescriptions";
  return "/patient/prescriptions";
}

export function RequireAuth({
  roles,
  children,
}: {
  roles?: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // No autenticado -> a login con next
    if (!isAuthenticated || !user) {
      const query = sp?.toString();
      const next = query ? `${pathname}?${query}` : pathname;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // Autenticado pero sin rol permitido -> lo mando al home de su rol
    if (roles?.length && !roles.includes(user.role)) {
      router.replace(homeByRole(user.role));
    }
  }, [isLoading, isAuthenticated, user, roles, pathname, sp, router]);

  if (isLoading) return <div>Cargando…</div>;
  if (!isAuthenticated || !user) return null;
  if (roles?.length && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
