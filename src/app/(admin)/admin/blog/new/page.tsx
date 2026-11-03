import type { Metadata } from "next";
import { AdminBlogEditor } from "@/components/admin-blog-editor";

export const metadata: Metadata = {
  title: "New article",
  description: "Write a new journal article with a cover image and search details, then save it as a draft, schedule it, or publish it.",
};

export default function NewBlogPostPage() {
  return <AdminBlogEditor />;
}
