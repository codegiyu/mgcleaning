import { AdminReviewList, type ReviewFilter } from "@/components/admin-review-list";

const filters: ReviewFilter[] = ["all", "draft", "published"];

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  return <AdminReviewList initialStatus={filters.find((filter) => filter === status) ?? "all"} />;
}
