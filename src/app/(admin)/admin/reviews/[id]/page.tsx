import { AdminReviewEditor } from "@/components/admin-review-editor";

export default async function EditReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  return <AdminReviewEditor id={id} savedStatus={saved} />;
}
