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
};

export type InquiryStatus = "new" | "contacted" | "quoted" | "booked" | "closed";
export type PostStatus = "draft" | "published" | "archived";

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
  createdAt: string;
  updatedAt: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  authorName: string;
  serviceSlug: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: PostStatus;
  publishedAt: string | null;
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
  coverImageUrl?: string;
  coverImageAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type BlogPostPatch = Partial<BlogPostInput> & { status?: PostStatus };

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
    }
  >;
  GET_ADMIN_INQUIRIES: EndpointDefinition<undefined, Paginated<AdminInquiry>>;
  GET_ADMIN_INQUIRY: EndpointDefinition<undefined, AdminInquiry>;
  PATCH_ADMIN_INQUIRY: EndpointDefinition<
    { status?: InquiryStatus; internalNote?: string | null },
    AdminInquiry
  >;
  GET_ADMIN_BLOG_POSTS: EndpointDefinition<undefined, Paginated<BlogPost>>;
  GET_ADMIN_BLOG_POST: EndpointDefinition<undefined, BlogPost>;
  POST_ADMIN_BLOG_POST: EndpointDefinition<BlogPostInput, BlogPost>;
  PATCH_ADMIN_BLOG_POST: EndpointDefinition<BlogPostPatch, BlogPost>;
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
