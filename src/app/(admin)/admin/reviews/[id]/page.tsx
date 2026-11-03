import type { Metadata } from "next";
import { AdminReviewEditor } from "@/components/admin-review-editor";

export const metadata: Metadata = {
  title: "Edit review",
  description: "Edit a customer review, preview how it looks on the website, and publish, unpublish, or delete it.",
};

export default async function EditReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  return <AdminReviewEditor id={id} savedStatus={saved} />;
}
