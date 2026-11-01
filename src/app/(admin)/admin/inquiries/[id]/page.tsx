import { AdminInquiryRecord } from "@/components/admin-inquiry-record";

export default async function AdminInquiryPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminInquiryRecord id={(await params).id} />;
}
