import { RequireAuth } from "@/lib/guards/require-auth";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth roles={["patient"]}>{children}</RequireAuth>;
}
