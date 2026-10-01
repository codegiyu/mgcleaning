"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { callApi } from "@/lib/api/callApi";
import type { BlogPost, BlogPostInput, PostStatus } from "@/lib/api/endpoints";
import { services } from "@/content/demo-content";

type Draft = BlogPostInput;
const blankDraft: Draft = { title: "", slug: "", excerpt: "", body: "", category: "Cleaning advice", authorName: "M&G Cleaning Services", serviceSlug: "home-cleaning", coverImageUrl: "", coverImageAlt: "", seoTitle: "", seoDescription: "" };

function makeSlug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180);
}

export function AdminBlogEditor({ id }: { id?: string }) {
  const router = useRouter();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    void callApi("GET_ADMIN_BLOG_POST", { pathParams: { id } }).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.type === "error") { setError(result.message); return; }
      const current = result.data;
      setPost(current);
      setSlugTouched(true);
      setDraft({
        title: current.title,
        slug: current.slug,
        excerpt: current.excerpt,
        body: current.body,
        category: current.category,
        authorName: current.authorName,
        serviceSlug: current.serviceSlug ?? "home-cleaning",
        coverImageUrl: current.coverImageUrl ?? "",
        coverImageAlt: current.coverImageAlt ?? "",
        seoTitle: current.seoTitle ?? "",
        seoDescription: current.seoDescription ?? "",
      });
    });
    return () => { active = false; };
  }, [id]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function insertMarkup(kind: "heading" | "bold" | "bullet") {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = draft.body.slice(0, start);
    const selected = draft.body.slice(start, end);
    const after = draft.body.slice(end);
    let nextBody = draft.body;
    let selectionStart = start;
    let selectionEnd = end;

    if (kind === "heading") {
      const lineStart = before.lastIndexOf("\n") + 1;
      nextBody = before.slice(0, lineStart) + "## " + before.slice(lineStart) + selected + after;
      selectionStart = start + 3;
      selectionEnd = Math.max(selectionStart, end + 3);
    } else if (kind === "bullet") {
      const lineStart = before.lastIndexOf("\n") + 1;
      nextBody = before.slice(0, lineStart) + "- " + before.slice(lineStart) + selected + after;
      selectionStart = start + 2;
      selectionEnd = Math.max(selectionStart, end + 2);
    } else {
      nextBody = before + `**${selected || "text"}**` + after;
      selectionStart = selected ? start : start + 2;
      selectionEnd = selected ? end + 4 : start + 6;
    }
    update("body", nextBody);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  async function save(targetStatus: PostStatus) {
    if (formRef.current && !formRef.current.reportValidity()) return;
    if (targetStatus === "published" && (!draft.coverImageUrl?.trim() || !draft.coverImageAlt?.trim() || !draft.authorName.trim() || !draft.serviceSlug.trim())) {
      setError("Add an author, related service, cover image, and image alt text before publishing.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    const payload: BlogPostInput = {
      ...draft,
      coverImageUrl: draft.coverImageUrl?.trim() || undefined,
      coverImageAlt: draft.coverImageAlt?.trim() || undefined,
      seoTitle: draft.seoTitle?.trim() || undefined,
      seoDescription: draft.seoDescription?.trim() || undefined,
    };
    let result;
    if (post) {
      result = await callApi("PATCH_ADMIN_BLOG_POST", {
        pathParams: { id: post.id },
        payload: { ...payload, status: targetStatus },
      });
    } else {
      result = await callApi("POST_ADMIN_BLOG_POST", { payload });
      if (result.type === "success" && targetStatus !== "draft") {
        result = await callApi("PATCH_ADMIN_BLOG_POST", {
          pathParams: { id: result.data.id },
          payload: { status: targetStatus },
        });
      }
    }
    setSaving(false);
    if (result.type === "error") { setError(result.message); return; }
    setPost(result.data);
    setNotice(targetStatus === "published" ? "Article published." : "Draft saved.");
    if (!id) router.replace(`/admin/blog/${result.data.id}`);
  }

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(post?.status ?? "draft");
  }

  if (loading) return <section className="admin-content"><p className="admin-inline-state">Loading article…</p></section>;
  if (id && !post && error) return <section className="admin-content"><p className="admin-error" role="alert">{error}</p><Link className="admin-text-link" href="/admin/blog">Back to articles →</Link></section>;

  const titlePreview = draft.seoTitle?.trim() || draft.title || "Article title";
  const excerptPreview = draft.seoDescription?.trim() || draft.excerpt || "The article summary will appear in search results.";
  const slug = draft.slug || "your-article-url";
  return (
    <form ref={formRef} className="admin-editor-page" onSubmit={submitDraft}>
      <header className="admin-editor-header">
        <div><h1>Blog</h1><p><Link href="/admin/blog">All posts</Link><span aria-hidden="true"> / </span>{post ? "Edit article" : "New article"}</p></div>
        <div className="admin-editor-actions">
          <button className="admin-secondary-button" type="submit" disabled={saving}>{saving ? "Saving…" : post?.status === "published" ? "Save changes" : "Save draft"}</button>
          {post?.status === "published" && <button className="admin-secondary-button" type="button" disabled={saving} onClick={() => void save("draft")}>Unpublish</button>}
          <button className="admin-primary-button" type="button" disabled={saving} onClick={() => void save("published")}>{post?.status === "published" ? "Update article" : "Publish"}</button>
        </div>
      </header>
      <div className="admin-editor-grid">
        <section className="admin-editor-main">
          <label className="admin-field admin-editor-title"><span>Article title</span><input required minLength={3} maxLength={180} value={draft.title} onChange={(event) => { const value = event.target.value; update("title", value); if (!slugTouched) update("slug", makeSlug(value)); }} /></label>
          <label className="admin-field"><span>URL slug</span><input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={180} value={draft.slug} onChange={(event) => { setSlugTouched(true); update("slug", makeSlug(event.target.value)); }} /><small className="admin-field-help">/blog/{draft.slug || slug}</small></label>
          <label className="admin-field"><span>Short summary</span><textarea required minLength={8} maxLength={320} rows={3} value={draft.excerpt} onChange={(event) => update("excerpt", event.target.value)} /><small className="admin-character-count">{draft.excerpt.length}/320</small></label>
          <div className="admin-field"><span>Article content</span>
            <div className="admin-editor-toolbar" role="toolbar" aria-label="Article formatting">
              <span>Plain text</span><button type="button" onClick={() => insertMarkup("heading")} aria-label="Insert heading">H2</button><button type="button" onClick={() => insertMarkup("bold")} aria-label="Bold selected text"><strong>B</strong></button><button type="button" onClick={() => insertMarkup("bullet")} aria-label="Insert bullet item">• List</button>
            </div>
            <textarea ref={editorRef} required minLength={20} maxLength={20_000} rows={18} value={draft.body} onChange={(event) => update("body", event.target.value)} placeholder="Write the article. Use a blank line between paragraphs." />
            <small className="admin-character-count">{draft.body.length}/20,000</small>
          </div>
          <p className="admin-editor-help">Formatting is limited to headings, bold and bullet lists. HTML is not rendered.</p>
        </section>
        <aside className="admin-editor-settings">
          <h2>Post settings</h2>
          <label className="admin-field"><span>Status</span><select value={post?.status ?? "draft"} onChange={(event) => { if (post) setPost({ ...post, status: event.target.value as PostStatus }); }} disabled={!post}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          <label className="admin-field"><span>Category</span><input required maxLength={80} value={draft.category} onChange={(event) => update("category", event.target.value)} /></label>
          <label className="admin-field"><span>Author</span><input required minLength={2} maxLength={120} value={draft.authorName} onChange={(event) => update("authorName", event.target.value)} /></label>
          <label className="admin-field"><span>Related service</span><select required value={draft.serviceSlug} onChange={(event) => update("serviceSlug", event.target.value)}><option value="">Choose a service</option>{services.map((service) => <option key={service.slug} value={service.slug}>{service.title}</option>)}</select></label>
          <label className="admin-field"><span>Featured image URL</span><input type="url" maxLength={2048} value={draft.coverImageUrl} onChange={(event) => update("coverImageUrl", event.target.value)} placeholder="https://…" /></label>
          <label className="admin-field"><span>Image alt text</span><input maxLength={250} value={draft.coverImageAlt} onChange={(event) => update("coverImageAlt", event.target.value)} placeholder="Describe the image" /></label>
          <div className="admin-search-preview"><h2>Search preview</h2><span>/blog/{slug}</span><strong>{titlePreview}</strong><p>{excerptPreview}</p></div>
        </aside>
      </div>
      {(error || notice) && <p className={error ? "admin-error admin-editor-feedback" : "admin-success admin-editor-feedback"} role={error ? "alert" : "status"}>{error || notice}</p>}
      <div className="admin-editor-bottom-actions"><Link className="admin-text-link" href="/admin/blog">Cancel and return to posts</Link><button className="admin-primary-button" type="button" disabled={saving} onClick={() => void save(post?.status ?? "draft")}>{saving ? "Saving…" : post?.status === "published" ? "Save changes" : "Save draft"}</button></div>
    </form>
  );
}
