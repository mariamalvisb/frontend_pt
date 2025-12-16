"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { performLogout } from "@/lib/auth";

export function LogoutButton({
  className = "rounded-md border px-3 py-2 text-sm disabled:opacity-50",
  label = "Cerrar sesión",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    if (loading) return;
    setLoading(true);

    try {
      await performLogout();
    } finally {
      // 1) Intento SPA
      router.replace("/login");
      router.refresh();

      // 2) Fallback definitivo (evita que tengas que refrescar manualmente)
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onLogout}
      disabled={loading}
    >
      {loading ? "Cerrando..." : label}
    </button>
  );
}
