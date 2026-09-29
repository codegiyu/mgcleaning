"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminIcon } from "@/components/admin-shell";
import { callApi } from "@/lib/api/callApi";
import type { BlogPost, PostStatus } from "@/lib/api/endpoints";

const filters: { id: PostStatus | "all"; label: string }[] = [
  { id: "all", label: "All posts" },
  { id: "draft", label: "Drafts" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState<PostStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_BLOG_POSTS", { params: { status, query, pageSize: 50 } }).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.type === "error") setError(result.message);
      else { setPosts(result.data.items); setError(""); }
    });
    return () => { active = false; };
  }, [query, status]);

  return (
    <section className="admin-content">
      <header className="admin-page-heading">
        <div><h1>Blog</h1><p>Write useful articles and share them from Instagram.</p></div>
        <Link className="admin-primary-link" href="/admin/blog/new">New article <span aria-hidden="true">＋</span></Link>
      </header>
      <div className="admin-blog-toolbar">
        <div className="admin-inquiry-tabs" role="tablist" aria-label="Filter articles by status">{filters.map((filter) => <button type="button" role="tab" aria-selected={status === filter.id} className={status === filter.id ? "admin-tab admin-tab-active" : "admin-tab"} key={filter.id} onClick={() => { setLoading(true); setStatus(filter.id); }}>{filter.label}</button>)}</div>
        <label className="admin-search admin-search-small"><span className="admin-visually-hidden">Search articles</span><span aria-hidden="true"><AdminIcon name="search" /></span><input type="search" placeholder="Search articles…" value={query} onChange={(event) => { setLoading(true); setQuery(event.target.value); }} /></label>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading ? <p className="admin-inline-state">Loading articles…</p> : posts.length ? (
        <div className="admin-table-scroll"><table className="admin-table admin-post-table">
          <thead><tr><th scope="col">Article</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Updated</th><th><span className="admin-visually-hidden">Edit article</span></th></tr></thead>
          <tbody>{posts.map((post) => <tr key={post.id}>
            <td><Link className="admin-post-title" href={`/admin/blog/${post.id}`}><strong>{post.title}</strong><small>/blog/{post.slug}</small></Link></td>
            <td>{post.category}</td><td><span className={`admin-status admin-status-${post.status}`}>{post.status}</span></td><td>{formatDate(post.updatedAt)}</td>
            <td><Link className="admin-row-arrow" aria-label={`Edit ${post.title}`} href={`/admin/blog/${post.id}`}><AdminIcon name="chevron" /></Link></td>
          </tr>)}</tbody>
        </table></div>
      ) : <div className="admin-empty-state"><h2>No articles here yet.</h2><p>Create a draft, then publish it when the copy and details are ready.</p><Link className="admin-text-link" href="/admin/blog/new">Write the first article →</Link></div>}
    </section>
  );
}
