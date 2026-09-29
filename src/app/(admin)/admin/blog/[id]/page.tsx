import { AdminBlogEditor } from "@/components/admin-blog-editor";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminBlogEditor id={(await params).id} />;
}
