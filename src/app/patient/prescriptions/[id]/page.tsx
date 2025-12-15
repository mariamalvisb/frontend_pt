import PatientPrescriptionDetail from "@/components/ui/prescriptions/PatientPrescriptionDetail";

export default async function PatientPrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientPrescriptionDetail id={id} />;
}
