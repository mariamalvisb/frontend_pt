import { RequireAuth } from "@/lib/guards/require-auth";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth roles={["doctor"]}>{children}</RequireAuth>;
}
