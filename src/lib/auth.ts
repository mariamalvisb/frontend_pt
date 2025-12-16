import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";
import type { AuthProfile, Role } from "@/types";

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

type RegisterResponse = any;

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Usa POST /auth/register
 * Si tu backend no acepta "role", quita role del body (te lo ajusto con el error exacto).
 */
export async function registerUser(payload: {
  email: string;
  password: string;
  name: string;
  role?: Role;
}): Promise<RegisterResponse> {
  const token = useAuthStore.getState().accessToken;

  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    accessToken: token, // si es público no molesta; si es protegido lo necesita
    body: JSON.stringify(payload),
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
  return apiFetch<RefreshResponse>("/auth/refresh", {
    method: "POST",
    accessToken: refreshToken,
    body: JSON.stringify({ refreshToken }),
  });
}

/**
 * Bootstrap fluido:
 * - Si ya hay user en store -> NO bloquea la UI
 * - Valida tokens en background
 * - Si falla -> logout
 */
export async function bootstrapAuth(): Promise<void> {
  if (typeof window === "undefined") return;

  const store = useAuthStore.getState();
  const { user, accessToken, refreshToken, setLoading, setSession, logout } =
    store;

  // ✅ Si ya tengo usuario persistido, NO me quedo pegado en "Cargando..."
  if (user) {
    setLoading(false);

    // Validación en background
    try {
      if (accessToken) {
        const profile = await getProfile(accessToken);
        setSession({ user: profile.user });
        return;
      }

      if (refreshToken) {
        const renewed = await refreshTokens(refreshToken);
        const profile = await getProfile(renewed.accessToken);

        setSession({
          user: profile.user,
          accessToken: renewed.accessToken,
          refreshToken: renewed.refreshToken,
        });
        return;
      }
    } catch {
      logout();
    }

    return;
  }

  // Si NO hay user, ahí sí muestro loading mientras intento recuperar sesión
  setLoading(true);

  if (!accessToken && !refreshToken) {
    setSession({ user: null, accessToken: null, refreshToken: null });
    return;
  }

  if (accessToken) {
    try {
      const profile = await getProfile(accessToken);
      setSession({ user: profile.user });
      return;
    } catch {
      // seguimos a refresh
    }
  }

  if (!refreshToken) {
    logout();
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
    logout();
  }
}
