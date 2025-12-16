// src/lib/auth.ts
import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";
import type { AuthProfile } from "@/types";

type LoginResponse = {
  user: AuthProfile;
  accessToken: string;
  refreshToken: string;
};

type ProfileResponse = {
  message: string;
  user: AuthProfile;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

type LogoutResponse = {
  message: string;
};

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile(
  accessToken: string
): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/auth/profile", {
    method: "GET",
    accessToken,
  });
}

export async function refreshTokens(
  refreshToken: string
): Promise<RefreshResponse> {
  // Swagger: refresh token en Authorization Bearer + body { refreshToken }
  return apiFetch<RefreshResponse>("/auth/refresh", {
    method: "POST",
    accessToken: refreshToken, // -> Authorization: Bearer <refreshToken>
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutRequest(
  accessToken: string
): Promise<LogoutResponse> {
  // Swagger muestra sin body; usualmente protegido por Bearer accessToken
  return apiFetch<LogoutResponse>("/auth/logout", {
    method: "POST",
    accessToken,
  });
}

function clearAuthStorage() {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-v1");
    }
  } catch {
    // no-op
  }
}

/**
 * Logout robusto:
 * 1) intenta pegarle al backend (/auth/logout) si hay accessToken
 * 2) SIEMPRE limpia store + storage
 */
export async function performLogout(): Promise<void> {
  if (typeof window === "undefined") return;

  const { accessToken } = useAuthStore.getState();

  try {
    if (accessToken) await logoutRequest(accessToken);
  } catch {
    // aunque falle (token vencido), igual cerramos sesión en frontend
  } finally {
    useAuthStore.getState().logout();
    clearAuthStorage();
  }
}

/**
 * Carga sesión al iniciar la app:
 * 1) si hay accessToken -> /auth/profile
 * 2) si falla y hay refreshToken -> /auth/refresh -> /auth/profile
 * 3) si falla -> logout (limpia store + storage)
 *
 * IMPORTANTE: ejecutar solo en cliente (componentes con "use client").
 */
export async function bootstrapAuth(): Promise<void> {
  if (typeof window === "undefined") return;

  const { accessToken, refreshToken, setLoading, setSession } =
    useAuthStore.getState();

  setLoading(true);

  // sin tokens: listo
  if (!accessToken && !refreshToken) {
    setSession({ user: null, accessToken: null, refreshToken: null });
    clearAuthStorage();
    return;
  }

  // 1) intentar profile con accessToken
  if (accessToken) {
    try {
      const profile = await getProfile(accessToken);
      setSession({ user: profile.user });
      return;
    } catch {
      // seguimos a refresh
    }
  }

  // 2) refresh si existe refreshToken
  if (!refreshToken) {
    useAuthStore.getState().logout();
    clearAuthStorage();
    return;
  }

  try {
    const renewed = await refreshTokens(refreshToken);
    const profile = await getProfile(renewed.accessToken);

    setSession({
      user: profile.user,
      accessToken: renewed.accessToken,
      refreshToken: renewed.refreshToken,
    });
  } catch {
    useAuthStore.getState().logout();
    clearAuthStorage();
  }
}
