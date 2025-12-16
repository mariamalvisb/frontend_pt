"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
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

  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    bootstrapAuth();
  }, []);

  const nextUrl = useMemo(() => {
    // Evita useSearchParams() para que no rompa el build en App Router
    const search =
      typeof window !== "undefined" ? window.location.search ?? "" : "";
    return `${pathname}${search}`;
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;

    // No autenticado -> a login con next
    if (!isAuthenticated || !user) {
      router.replace(`/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }

    // Autenticado pero sin rol permitido -> lo mando al home de su rol
    if (roles?.length && !roles.includes(user.role)) {
      router.replace(homeByRole(user.role));
    }
  }, [isLoading, isAuthenticated, user, roles, nextUrl, router]);

  if (isLoading) return <div>Cargando…</div>;
  if (!isAuthenticated || !user) return null;
  if (roles?.length && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
