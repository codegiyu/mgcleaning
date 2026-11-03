import { AdminGalleryManager, type GalleryFilter } from "@/components/admin-gallery-manager";

const filters: GalleryFilter[] = ["all", "draft", "published"];

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  return <AdminGalleryManager initialStatus={filters.find((filter) => filter === status) ?? "all"} />;
}
