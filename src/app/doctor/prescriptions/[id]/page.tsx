import DoctorPrescriptionDetail from "@/components/ui/prescriptions/DoctorPrescriptionDetail";

type Params = { id: string };

export default async function DoctorPrescriptionDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  return <DoctorPrescriptionDetail id={id} />;
}
