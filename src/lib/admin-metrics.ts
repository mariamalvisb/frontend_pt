import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth.store";

function readTotal(res: any): number {
  if (res?.meta && typeof res.meta.total === "number") return res.meta.total;
  if (typeof res?.total === "number") return res.total;
  if (Array.isArray(res?.data)) return res.data.length;
  if (Array.isArray(res)) return res.length;
  return 0;
}

async function getTotal(path: string): Promise<number> {
  const token = useAuthStore.getState().accessToken;

  const res = await apiFetch<any>(path, {
    method: "GET",
    accessToken: token,
  });

  return readTotal(res);
}

export async function getAdminQuickMetrics(): Promise<{
  patients: number;
  doctors: number;
  prescriptions: number;
}> {
  const [patients, doctors, prescriptions] = await Promise.all([
    getTotal("/patients?page=1&limit=1"),
    getTotal("/doctor?page=1&limit=1"),
    getTotal("/prescriptions/admin?page=1&limit=1"),
  ]);

  return { patients, doctors, prescriptions };
}
