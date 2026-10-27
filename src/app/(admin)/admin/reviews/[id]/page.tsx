import { AdminReviewEditor } from "@/components/admin-review-editor";

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminReviewEditor id={(await params).id} />;
}
