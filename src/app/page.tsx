"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { bootstrapAuth } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    const target =
      user.role === "admin"
        ? "/admin"
        : user.role === "doctor"
        ? "/doctor/prescriptions"
        : "/patient/prescriptions";

    router.replace(target);
  }, [isLoading, isAuthenticated, user, router]);

  return <div className="page-container">Cargando…</div>;
}
