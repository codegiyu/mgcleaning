import { formatWat } from "./wat-time.ts";

type ActivityEvent = { action: string; metadata: Record<string, unknown> };

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  closed: "Closed",
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

const fieldLabels: Record<string, string> = {
  inquiryNotificationEmail: "alert inbox",
  defaultAuthorName: "default author",
};

const label = (value: unknown) => (typeof value === "string" ? statusLabels[value] ?? value : "");
const text = (value: unknown) => (typeof value === "string" ? value : "");
const count = (value: unknown) => (typeof value === "number" ? value : 0);
const fields = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const plural = (value: number, word: string) => `${value} ${word}${value === 1 ? "" : "s"}`;

/** Plain-language summary of an audit event. Metadata holds names and statuses only, never customer details. */
export function describeActivity({ action, metadata }: ActivityEvent): string {
  const slug = text(metadata.slug);
  const article = slug ? `“${slug}”` : "an article";
  switch (action) {
    case "auth.login": return "Signed in";
    case "auth.login_failed": return "Failed sign-in attempt";
    case "auth.logout": return "Signed out";
    case "auth.password_change": {
      const revoked = count(metadata.revokedSessions);
      return revoked ? `Changed password and signed out ${plural(revoked, "other session")}` : "Changed password";
    }
    case "auth.password_reset": return "Password reset by an operator";
    case "auth.session_revoke":
      return metadata.scope === "others" ? `Signed out ${plural(count(metadata.revokedSessions), "other session")}` : "Signed out another session";
    case "inquiry.update": {
      const parts: string[] = [];
      if (metadata.statusTo) parts.push(`Moved from ${label(metadata.statusFrom)} to ${label(metadata.statusTo)}`);
      if (fields(metadata.fields).includes("internalNote")) parts.push(parts.length ? "updated internal notes" : "Updated internal notes");
      return parts.join(" and ") || "Saved without changes";
    }
    case "post.create": return `Created draft ${article}`;
    case "post.update": return `Edited ${article}`;
    case "post.publish": return metadata.scheduled ? `Published ${article} on schedule` : `Published ${article}`;
    case "post.unpublish": return `Unpublished ${article}`;
    case "post.archive": return `Archived ${article}`;
    case "post.schedule": {
      const when = text(metadata.publishAt);
      return when ? `Scheduled ${article} for ${formatWat(when)}` : `Scheduled ${article}`;
    }
    case "media.upload": return "Uploaded an image";
    case "media.update": return "Updated image alt text";
    case "media.delete": return "Deleted an image";
    case "review.create": return metadata.status === "published" ? "Added and published a review" : "Added a draft review";
    case "review.update": return "Edited a review";
    case "review.publish": return "Published a review";
    case "review.unpublish": return "Unpublished a review";
    case "review.delete": return metadata.statusFrom === "published" ? "Deleted a published review" : "Deleted a draft review";
    case "settings.update": {
      const names = fields(metadata.fields).map((name) => fieldLabels[name] ?? name);
      return names.length ? `Updated settings: ${names.join(", ")}` : "Updated settings";
    }
    default: return action;
  }
}

/** Scheduled publishing and operator scripts act without a signed-in admin. */
export function describeActor(actorEmail: string | null) {
  return actorEmail ?? "System";
}
