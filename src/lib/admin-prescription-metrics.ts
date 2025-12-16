import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";

function readTotal(res: any): number {
  if (res?.meta && typeof res.meta.total === "number") return res.meta.total;
  if (typeof res?.total === "number") return res.total;
  if (Array.isArray(res?.data)) return res.data.length;
  if (Array.isArray(res)) return res.length;
  return 0;
}

export async function getPrescriptionStatusTotals(): Promise<{
  pending: number;
  consumed: number;
}> {
  const token = useAuthStore.getState().accessToken;

  const [pendingRes, consumedRes] = await Promise.all([
    apiFetch<any>("/prescriptions/admin?page=1&limit=1&status=pending", {
      method: "GET",
      accessToken: token,
    }),
    apiFetch<any>("/prescriptions/admin?page=1&limit=1&status=consumed", {
      method: "GET",
      accessToken: token,
    }),
  ]);

  return {
    pending: readTotal(pendingRes),
    consumed: readTotal(consumedRes),
  };
}

function yyyyMmDd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getPrescriptionsByDay(params: {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}): Promise<{ date: string; count: number }[]> {
  const token = useAuthStore.getState().accessToken;

  const limit = 50;
  let page = 1;
  let totalPages = 1;

  const counts = new Map<string, number>();

  do {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      from: params.from,
      to: params.to,
    });

    const res = await apiFetch<any>(`/prescriptions/admin?${qs.toString()}`, {
      method: "GET",
      accessToken: token,
    });

    const items = res?.data ?? [];
    const meta = res?.meta;
    totalPages = typeof meta?.totalPages === "number" ? meta.totalPages : 1;

    for (const p of items) {
      const raw = p?.createdAt;
      if (!raw) continue;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) continue;
      const key = yyyyMmDd(d);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    page++;
  } while (page <= totalPages);

  // rellenar días faltantes con 0
  const start = new Date(`${params.from}T00:00:00`);
  const end = new Date(`${params.to}T00:00:00`);

  const out: { date: string; count: number }[] = [];
  const cur = new Date(start);

  while (cur.getTime() <= end.getTime()) {
    const key = yyyyMmDd(cur);
    out.push({ date: key, count: counts.get(key) ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }

  return out;
}
