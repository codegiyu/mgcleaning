import { AdminActivityList } from "@/components/admin-activity-list";

export default function AdminActivityPage() {
  return (
    <section className="admin-content">
      <header className="admin-page-heading"><div><h1>Activity</h1><p>Sign-ins, inquiry updates, publishing, reviews, gallery changes, uploads, and settings changes, newest first.</p></div></header>
      <div className="admin-settings-card admin-activity-card"><AdminActivityList pageSize={30} /></div>
    </section>
  );
}
