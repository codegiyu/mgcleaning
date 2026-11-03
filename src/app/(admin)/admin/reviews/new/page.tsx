import type { Metadata } from "next";
import { AdminReviewEditor } from "@/components/admin-review-editor";

export const metadata: Metadata = {
  title: "New review",
  description: "Add a review a customer sent, preview how it will look, and publish it once they have agreed.",
};

export default function NewReviewPage() {
  return <AdminReviewEditor />;
}
