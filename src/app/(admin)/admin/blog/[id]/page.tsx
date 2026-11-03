import type { Metadata } from "next";
import { AdminBlogEditor } from "@/components/admin-blog-editor";

export const metadata: Metadata = {
  title: "Edit article",
  description: "Edit a journal article, its cover image, and search details, then save, schedule, publish, or unpublish it.",
};

export default async function EditBlogPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  return <AdminBlogEditor id={id} savedStatus={saved} />;
}
