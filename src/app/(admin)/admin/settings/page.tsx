"use client";

import { useState } from "react";
import { AdminPasswordForm, AdminSessionList, AdminSiteSettingsForm } from "@/components/admin-account-settings";

export default function AdminSettingsPage() {
  const [sessionsVersion, setSessionsVersion] = useState(0);
  return (
    <section className="admin-content">
      <header className="admin-page-heading"><div><h1>Settings</h1><p>Your account security and day-to-day operational settings.</p></div></header>
      <div className="admin-settings-grid">
        <AdminPasswordForm onChanged={() => setSessionsVersion((version) => version + 1)} />
        <AdminSessionList refreshKey={sessionsVersion} />
        <AdminSiteSettingsForm />
      </div>
    </section>
  );
}
