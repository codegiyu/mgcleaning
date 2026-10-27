export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** The request payload and response shape associated with one API operation. */
export type EndpointDefinition<Payload, Response> = {
  payload: Payload;
  response: Response;
};

export type EndpointDetails = {
  path: `/${string}`;
  method: HttpMethod;
  pathParams?: readonly string[];
};

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type CreateInquiryPayload = {
  name: string;
  phone: string;
  email?: string;
  inquiryType: "contact" | "booking";
  topic?: string;
  preferredContactMethod?: "phone" | "whatsapp" | "either";
  companyWebsite?: string;
  turnstileToken?: string;
  serviceInterest?: string;
  preferredDate?: string;
  preferredTime?: string;
  location?: string;
  spaceType?: string;
  message: string;
  /** First-touch attribution; the API normalises it and never rejects an enquiry over it. */
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  landingPath?: string;
};

export type InquiryStatus = "new" | "contacted" | "quoted" | "booked" | "closed";
export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export type AdminInquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  inquiryType: "contact" | "booking";
  topic: string | null;
  serviceInterest: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  location: string | null;
  spaceType: string | null;
  message: string;
  source: string;
  status: InquiryStatus;
  internalNote: string | null;
  publicReference: string;
  preferredContactMethod: "phone" | "whatsapp" | "either" | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  landingPath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InquiryNotification = {
  kind: "internal" | "customer";
  status: "pending" | "processing" | "sent" | "failed" | "dead_letter";
  attempts: number;
  sentAt: string | null;
};

export type AdminInquiryRecord = AdminInquiry & { notifications: InquiryNotification[] };

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  authorName: string;
  serviceSlug: string | null;
  coverMediaId: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: PostStatus;
  publishedAt: string | null;
  /** Go-live time for scheduled posts (ISO); null otherwise. */
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type BlogPostInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  authorName: string;
  serviceSlug: string;
  /** A verified upload; the server copies its public URL onto the post. */
  coverMediaId?: string | null;
  coverImageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type AdminSession = {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  userAgent: string | null;
  current: boolean;
};

export type AuditEntityType = "admin_user" | "inquiry" | "blog_post" | "media_asset" | "review" | "site_settings";

export type ReviewStatus = "draft" | "published";
export type ReviewSource = "whatsapp" | "instagram" | "google" | "email" | "in_person" | "other";

/** A customer review as the dashboard sees it. Only published rows with consent reach the site. */
export type AdminReview = {
  id: string;
  displayName: string;
  context: string | null;
  quote: string;
  rating: number | null;
  serviceSlug: string | null;
  source: ReviewSource;
  /** Calendar date (YYYY-MM-DD) the customer gave the review. */
  receivedOn: string | null;
  featured: boolean;
  status: ReviewStatus;
  consentConfirmedAt: string | null;
  consentConfirmedBy: string | null;
  publishedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewInput = {
  displayName: string;
  context?: string | null;
  quote: string;
  rating?: number | null;
  serviceSlug?: string | null;
  source: ReviewSource;
  receivedOn?: string | null;
  featured?: boolean;
  status?: ReviewStatus;
  /** The editor confirms the customer agreed to the review and name appearing on the site; required to publish. */
  consentConfirmed?: boolean;
};

/** `expectedUpdatedAt` is the `updatedAt` the edit started from; a newer row returns 409. */
export type ReviewPatch = Partial<ReviewInput> & { expectedUpdatedAt: string };

export type ReviewCounts = { published: number; publishedThisYear: number; draft: number };

export type AuditEvent = {
  id: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string | null;
  actorEmail: string | null;
  metadata: Record<string, unknown>;
  requestId: string | null;
  createdAt: string;
};

export type SiteSettings = {
  inquiryNotificationEmail: string | null;
  effectiveNotificationEmail: string;
  defaultAuthorName: string | null;
  updatedAt: string | null;
};

export type MediaIntent = "blog-cover";

export type MediaAsset = {
  id: string;
  url: string;
  intent: MediaIntent;
  contentType: string;
  byteSize: number | null;
  altText: string | null;
  originalFilename: string | null;
  status: "pending" | "verified" | "failed" | "expired" | "deleted";
  createdAt: string;
  verifiedAt: string | null;
};

export type MediaUploadRequest = {
  intent: MediaIntent;
  fileExtension: string;
  byteSize: number;
  filename?: string;
  altText?: string;
};

export type MediaUploadTicket = {
  asset: MediaAsset;
  upload: {
    url: string;
    method: "PUT";
    /** Must be sent unchanged: they are part of the presigned signature. */
    headers: Record<string, string>;
    expiresAt: string;
  };
};

/** `publishAt` must carry a UTC offset; see `src/lib/admin/wat-time.ts`. */
export type BlogPostPatch = Partial<BlogPostInput> & { status?: PostStatus; publishAt?: string };

export interface AllEndpoints {
  GET_HEALTH: EndpointDefinition<
    undefined,
    { service: "mgcleaning-backend"; status: "ok" }
  >;
  POST_CREATE_INQUIRY: EndpointDefinition<
    CreateInquiryPayload,
    {
      inquiryId: string;
      reference: string;
      notificationQueued: boolean;
      internalNotificationQueued: boolean;
      customerEmailQueued: boolean | null;
    }
  >;
  POST_ADMIN_LOGIN: EndpointDefinition<
    { email: string; password: string },
    { id: string; email: string }
  >;
  GET_ADMIN_SESSION: EndpointDefinition<
    undefined,
    | { authenticated: true; user: { id: string; email: string } }
    | { authenticated: false; user: null }
  >;
  POST_ADMIN_LOGOUT: EndpointDefinition<undefined, { signedOut: true }>;
  GET_ADMIN_OVERVIEW: EndpointDefinition<
    undefined,
    {
      inquiryCounts: { total: number; new: number };
      postCounts: { draft: number; published: number };
      emailOutboxCounts?: { pending: number; failed: number; deadLetter: number };
      cacheRevalidationCounts?: { pending: number; deadLetter: number };
      reviewCounts?: ReviewCounts;
    }
  >;
  GET_ADMIN_INQUIRIES: EndpointDefinition<undefined, Paginated<AdminInquiry>>;
  GET_ADMIN_INQUIRY: EndpointDefinition<undefined, AdminInquiryRecord>;
  PATCH_ADMIN_INQUIRY: EndpointDefinition<
    { status?: InquiryStatus; internalNote?: string | null },
    AdminInquiry
  >;
  GET_ADMIN_BLOG_POSTS: EndpointDefinition<undefined, Paginated<BlogPost>>;
  GET_ADMIN_BLOG_POST: EndpointDefinition<undefined, BlogPost>;
  POST_ADMIN_BLOG_POST: EndpointDefinition<BlogPostInput, BlogPost>;
  PATCH_ADMIN_BLOG_POST: EndpointDefinition<BlogPostPatch, BlogPost>;
  POST_ADMIN_MEDIA_UPLOAD: EndpointDefinition<MediaUploadRequest, MediaUploadTicket>;
  POST_ADMIN_MEDIA_VERIFY: EndpointDefinition<undefined, MediaAsset>;
  GET_ADMIN_MEDIA: EndpointDefinition<undefined, Paginated<MediaAsset>>;
  PATCH_ADMIN_MEDIA: EndpointDefinition<{ altText: string | null }, MediaAsset>;
  DELETE_ADMIN_MEDIA: EndpointDefinition<undefined, { deleted: true }>;
  POST_ADMIN_CHANGE_PASSWORD: EndpointDefinition<{ currentPassword: string; newPassword: string }, { revokedSessions: number }>;
  GET_ADMIN_SESSIONS: EndpointDefinition<undefined, AdminSession[]>;
  DELETE_ADMIN_SESSION: EndpointDefinition<undefined, { revoked: true }>;
  POST_ADMIN_REVOKE_OTHER_SESSIONS: EndpointDefinition<undefined, { revokedSessions: number }>;
  GET_ADMIN_AUDIT: EndpointDefinition<undefined, Paginated<AuditEvent>>;
  GET_ADMIN_SETTINGS: EndpointDefinition<undefined, SiteSettings>;
  PATCH_ADMIN_SETTINGS: EndpointDefinition<{ inquiryNotificationEmail?: string | null; defaultAuthorName?: string | null }, SiteSettings>;
  GET_ADMIN_REVIEWS: EndpointDefinition<undefined, Paginated<AdminReview> & { counts: ReviewCounts }>;
  GET_ADMIN_REVIEW: EndpointDefinition<undefined, AdminReview>;
  POST_ADMIN_REVIEW: EndpointDefinition<ReviewInput, AdminReview>;
  PATCH_ADMIN_REVIEW: EndpointDefinition<ReviewPatch, AdminReview>;
  /** Pass `expectedUpdatedAt` as a query parameter. */
  DELETE_ADMIN_REVIEW: EndpointDefinition<undefined, { deleted: true }>;
}

export const ENDPOINTS = {
  GET_HEALTH: { path: "/health", method: "GET" },
  POST_CREATE_INQUIRY: { path: "/inquiries", method: "POST" },
  POST_ADMIN_LOGIN: { path: "/admin/auth/login", method: "POST" },
  GET_ADMIN_SESSION: { path: "/admin/auth/session", method: "GET" },
  POST_ADMIN_LOGOUT: { path: "/admin/auth/logout", method: "POST" },
  GET_ADMIN_OVERVIEW: { path: "/admin/overview", method: "GET" },
  GET_ADMIN_INQUIRIES: { path: "/admin/inquiries", method: "GET" },
  GET_ADMIN_INQUIRY: {
    path: "/admin/inquiries/:id",
    method: "GET",
    pathParams: ["id"],
  },
  PATCH_ADMIN_INQUIRY: {
    path: "/admin/inquiries/:id",
    method: "PATCH",
    pathParams: ["id"],
  },
  GET_ADMIN_BLOG_POSTS: { path: "/admin/blog/posts", method: "GET" },
  GET_ADMIN_BLOG_POST: {
    path: "/admin/blog/posts/:id",
    method: "GET",
    pathParams: ["id"],
  },
  POST_ADMIN_BLOG_POST: { path: "/admin/blog/posts", method: "POST" },
  PATCH_ADMIN_BLOG_POST: {
    path: "/admin/blog/posts/:id",
    method: "PATCH",
    pathParams: ["id"],
  },
  POST_ADMIN_MEDIA_UPLOAD: { path: "/admin/media/uploads", method: "POST" },
  POST_ADMIN_MEDIA_VERIFY: {
    path: "/admin/media/:id/verify",
    method: "POST",
    pathParams: ["id"],
  },
  GET_ADMIN_MEDIA: { path: "/admin/media", method: "GET" },
  PATCH_ADMIN_MEDIA: {
    path: "/admin/media/:id",
    method: "PATCH",
    pathParams: ["id"],
  },
  DELETE_ADMIN_MEDIA: {
    path: "/admin/media/:id",
    method: "DELETE",
    pathParams: ["id"],
  },
  POST_ADMIN_CHANGE_PASSWORD: { path: "/admin/account/password", method: "POST" },
  GET_ADMIN_SESSIONS: { path: "/admin/account/sessions", method: "GET" },
  DELETE_ADMIN_SESSION: {
    path: "/admin/account/sessions/:id",
    method: "DELETE",
    pathParams: ["id"],
  },
  POST_ADMIN_REVOKE_OTHER_SESSIONS: { path: "/admin/account/sessions/revoke-others", method: "POST" },
  GET_ADMIN_AUDIT: { path: "/admin/audit", method: "GET" },
  GET_ADMIN_SETTINGS: { path: "/admin/settings", method: "GET" },
  PATCH_ADMIN_SETTINGS: { path: "/admin/settings", method: "PATCH" },
  GET_ADMIN_REVIEWS: { path: "/admin/reviews", method: "GET" },
  GET_ADMIN_REVIEW: {
    path: "/admin/reviews/:id",
    method: "GET",
    pathParams: ["id"],
  },
  POST_ADMIN_REVIEW: { path: "/admin/reviews", method: "POST" },
  PATCH_ADMIN_REVIEW: {
    path: "/admin/reviews/:id",
    method: "PATCH",
    pathParams: ["id"],
  },
  DELETE_ADMIN_REVIEW: {
    path: "/admin/reviews/:id",
    method: "DELETE",
    pathParams: ["id"],
  },
} as const satisfies Record<keyof AllEndpoints, EndpointDetails>;

export type EndpointName = keyof AllEndpoints;

export type CallApiOptions<T extends EndpointName> = (AllEndpoints[T]["payload"] extends undefined
  ? { payload?: never }
  : { payload: AllEndpoints[T]["payload"] }) & {
  params?: QueryParams;
  pathParams?: Record<string, string>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};
