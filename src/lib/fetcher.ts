// src/lib/fetcher.ts
import { API_BASE_URL } from "./config";

type ApiEnvelope<T> = {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  data: T;
};

export type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type FetcherOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  accessToken?: string | null;
  responseType?: "json" | "blob";
};

function normalizeMessage(body: any) {
  const msg = body?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  if (typeof body?.error === "string") return body.error;
  return "Error en la petición";
}

async function parseError(res: Response) {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) return await res.json();
    return await res.text();
  } catch {
    return undefined;
  }
}

function unwrapData<T>(payload: any): T {
  // Si viene con el envelope estándar: { ..., data: ... }
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  // Si por alguna razón viene directo
  return payload as T;
}

export async function apiFetch<T = any>(
  path: string,
  opts: FetcherOptions = {}
): Promise<T> {
  const {
    accessToken = null,
    responseType = "json",
    headers = {},
    ...rest
  } = opts;

  const finalHeaders: Record<string, string> = { ...headers };

  if (
    rest.body &&
    !(rest.body instanceof FormData) &&
    !finalHeaders["Content-Type"]
  ) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (accessToken) {
    finalHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await parseError(res);
    const msg = typeof body === "string" ? body : normalizeMessage(body);
    throw new ApiError(res.status, msg, body);
  }

  if (responseType === "blob") {
    return (await res.blob()) as unknown as T;
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return (await res.text()) as unknown as T;
  }

  const json = await res.json();
  return unwrapData<T>(json);
}
