"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { bootstrapAuth, login as loginRequest } from "@/lib/auth";

import { AuthContainer } from "@/components/ui/AuthContainer";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");

  const { user, isAuthenticated, setSession, setLoading, isLoading } =
    useAuthStore();

  const [email, setEmail] = useState("patient@test.com");
  const [password, setPassword] = useState("patient123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (next) {
      router.replace(next);
      return;
    }

    const target =
      user.role === "admin"
        ? "/admin"
        : user.role === "doctor"
        ? "/doctor/prescriptions"
        : "/patient/prescriptions";

    router.replace(target);
  }, [isAuthenticated, user, next, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setSubmitting(true);
    setLoading(true);

    try {
      const res = await loginRequest(email.trim(), password);
      setSession({
        user: res.user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión");
      setSession({ user: null, accessToken: null, refreshToken: null });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }

  return (
    <AuthContainer>
      <Card
        title="Iniciar sesión"
        description="Ingresa tus credenciales para continuar."
      >
        {error ? <Alert>{error}</Alert> : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="patient@test.com"
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="patient123"
            required
            autoComplete="current-password"
          />

          <Button type="submit" disabled={submitting || isLoading}>
            {submitting || isLoading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          Tip: usa cuentas del seed (admin/doctor/patient).
        </p>
      </Card>
    </AuthContainer>
  );
}
