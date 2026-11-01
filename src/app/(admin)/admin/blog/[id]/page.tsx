import { AdminBlogEditor } from "@/components/admin-blog-editor";

export default async function EditBlogPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  return <AdminBlogEditor id={id} savedStatus={saved} />;
}
