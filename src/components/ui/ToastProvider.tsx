"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
};

type ToastInput = Omit<Toast, "id"> & { id?: never };

type ToastAPI = {
  push: (t: ToastInput) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
};

const ToastContext = createContext<ToastAPI | null>(null);

function uid() {
  return `${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (t: ToastInput) => {
      const id = uid();
      const toast: Toast = {
        id,
        type: t.type,
        title: t.title,
        message: t.message,
        duration: t.duration ?? 3200,
      };

      setToasts((prev) => [...prev, toast]);

      const tm = setTimeout(() => remove(id), toast.duration);
      timers.current.set(id, tm);
    },
    [remove]
  );

  const api = useMemo<ToastAPI>(
    () => ({
      push,
      success: (message, title, duration = 3200) =>
        push({ type: "success", message, title, duration }),
      error: (message, title, duration = 4200) =>
        push({ type: "error", message, title, duration }),
      info: (message, title, duration = 3200) =>
        push({ type: "info", message, title, duration }),
    }),
    [push]
  );

  useEffect(() => {
    return () => {
      // cleanup
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* viewport */}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => {
          const accent =
            t.type === "success"
              ? "border-l-4 border-emerald-600"
              : t.type === "error"
              ? "border-l-4 border-red-600"
              : "border-l-4 border-blue-600";

          const titleColor =
            t.type === "error" ? "text-red-700" : "text-gray-900";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto overflow-hidden rounded-lg border bg-white shadow-sm ${accent}`}
            >
              <div className="flex items-start gap-3 p-3">
                <div className="min-w-0 flex-1">
                  {t.title ? (
                    <div className={`text-sm font-semibold ${titleColor}`}>
                      {t.title}
                    </div>
                  ) : null}
                  <div className="text-sm text-gray-700">{t.message}</div>
                </div>

                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  onClick={() => remove(t.id)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast() debe usarse dentro de <ToastProvider />");
  }
  return ctx;
}
