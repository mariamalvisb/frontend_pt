import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthProfile, Role } from "@/types";

interface AuthState {
  user: AuthProfile | null;
  accessToken: string | null;
  refreshToken: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (payload: {
    user: AuthProfile | null;
    accessToken?: string | null;
    refreshToken?: string | null;
  }) => void;

  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      isAuthenticated: false,
      isLoading: true,

      setSession: ({ user, accessToken, refreshToken }) =>
        set((state) => ({
          user,
          // OJO: null debe sobrescribir (por eso no usamos ??)
          accessToken:
            accessToken !== undefined ? accessToken : state.accessToken,
          refreshToken:
            refreshToken !== undefined ? refreshToken : state.refreshToken,
          isAuthenticated: !!user,
          isLoading: false,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: "auth-v1",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
    }
  )
);
