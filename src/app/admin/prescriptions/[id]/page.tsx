import AdminPrescriptionDetail from "@/components/ui/prescriptions/AdminPrescriptionDetail";

export default async function AdminPrescriptionDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  return <AdminPrescriptionDetail id={id} />;
}
