import type { Metadata } from "next";
import { AdminInquiryRecord } from "@/components/admin-inquiry-record";

export const metadata: Metadata = {
  title: "Inquiry",
  description: "One website enquiry with the customer’s details, status, internal notes, and change history.",
};

export default async function AdminInquiryPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminInquiryRecord id={(await params).id} />;
}
