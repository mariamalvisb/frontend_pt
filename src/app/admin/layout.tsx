import { RequireAuth } from "@/lib/guards/require-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth roles={["admin"]}>{children}</RequireAuth>;
}
