import type { SessionAccount } from "@/lib/session";

const normalizeApiBaseUrl = (value?: string) => {
  const fallback = "http://localhost:4000/api";
  const trimmed = String(value || fallback).trim().replace(/\/+$/, "");

  if (/\/api$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);

type ApiError = {
  message?: string;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  role: "user" | "investor" | "founder";
  roleDetails: Record<string, unknown>;
  emailVerificationToken?: string;
};

export type EmailVerificationPurpose =
  | "register:user"
  | "register:investor"
  | "register:founder"
  | "join-us"
  | "partner-inquiry";

export type AuthResponse = {
  message: string;
  token: string;
  account: SessionAccount;
  dashboard?: DashboardResponse["dashboard"];
};

export type DashboardKpi = {
  key: string;
  title: string;
  value: string;
  color: "blue" | "green" | "purple" | "amber";
  trend: string;
};

export type DashboardTableRow = {
  startupName: string;
  investment: string;
  date: string;
  status: string;
};

export type DashboardResponse = {
  dashboard: {
    id: string;
    role: "user" | "investor" | "founder";
    title: string;
    kpis: DashboardKpi[];
    tables: {
      commitmentPortfolio: DashboardTableRow[];
      investmentPortfolio: DashboardTableRow[];
    };
    filters: Record<string, unknown>;
    widgetsData: Record<string, unknown>;
    layout: Array<Record<string, unknown>>;
    roleConfig: Record<string, unknown>;
    updatedAt: string;
  };
};

export type DynamicEvent = {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  bannerImage: string;
  bannerAlt: string;
  hostName: string;
  hostLogoText: string;
  dateLabel: string;
  locationLabel: string;
  mapUrl: string;
  calendarUrl: string;
  registrationUrl: string;
  ticketLabel: string;
  refundPolicy: string;
  about: string[];
  expectations: string[];
  differentiators: string[];
  audience: string[];
  tags: string[];
  photos: string[];
  videos: string[];
  faqs: Array<{ question: string; answer: string }>;
  isPublished?: boolean;
};

export type DynamicBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  coverImage: string;
  tags: string[];
  sections: Array<{ heading: string; content: string }>;
  isPublished?: boolean;
};

export type EventRegistration = {
  slug: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  locationLabel: string;
  ticketLabel: string;
  status: "registered" | "attended" | "cancelled";
  note: string;
  registeredAt: string;
  updatedAt: string;
};

export type EventParticipationSummary = {
  registeredCount: number;
  attendedCount: number;
  notedCount: number;
  latestRegistration: EventRegistration | null;
};

export type MyEventRegistrationsResponse = {
  registrations: EventRegistration[];
  summary: EventParticipationSummary;
};

export type EventRegistrationPayload = {
  slug: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  locationLabel: string;
  ticketLabel: string;
};

export type EventRegistrationMutationResponse = {
  message: string;
  registration: EventRegistration;
  summary: EventParticipationSummary;
};

export type EventInterestPayload = {
  slug: string;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  occupation?: string;
  startupName?: string;
  note?: string;
};

export type EventInterestResponse = {
  message: string;
  interest: {
    id: string;
    slug: string;
    title: string;
    fullName: string;
    email: string;
    status: string;
  };
};

export type AdminMember = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  city: string;
  referralCode?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  metadata?: Record<string, unknown>;
};

export type AdminEventInterest = {
  _id: string;
  slug: string;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  occupation?: string;
  startupName?: string;
  note?: string;
  status: string;
  createdAt: string;
};

export type NewsletterSubscriber = {
  _id: string;
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt?: string;
  updatedAt?: string;
};

export type NewsletterAudience = "subscribers" | "members" | "everyone";

export type CloudinarySignedUploadResponse = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
  publicId?: string;
  uploadUrl: string;
};

export type SiteNotice = {
  key: string;
  title: string;
  message: string;
  buttonLabel: string;
  buttonUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PartnerLogo = {
  _id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PartnerInquiry = {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string | null;
  companyType?: string;
  city?: string;
  partnershipType: string;
  partnershipGoal?: string;
  audienceSize?: string;
  budgetRange?: string;
  timeline?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  message?: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PartnerInquiryPayload = {
  companyName: string;
  companyType: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  partnershipType: string;
  partnershipGoal: string;
  audienceSize: string;
  budgetRange: string;
  timeline: string;
  website: string;
  linkedin: string;
  twitter: string;
  message: string;
  emailVerificationToken: string;
};

export const submitPartnerInquiryApi = (payload: PartnerInquiryPayload) =>
  request<{ ok: boolean; id: string }>("/content/partner-inquiry", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export type JoinRequestPayload = {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  companyName: string;
  linkedinProfile: string;
  website: string;
  city: string;
  whyJoin: string;
  referralSource: string;
  emailVerificationToken: string;
};

export type AdminJoinRequest = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  companyName: string;
  linkedinProfile: string;
  website: string;
  city: string;
  whyJoin: string;
  referralSource: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const registerApi = (payload: RegisterPayload) =>
  request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginApi = (payload: { email: string; password: string }) =>
  request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const sendEmailVerificationCodeApi = (payload: { email: string; purpose: EmailVerificationPurpose }) =>
  request<{ message: string }>("/auth/email-verification/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifyEmailCodeApi = (payload: { email: string; purpose: EmailVerificationPurpose; code: string }) =>
  request<{ message: string; verificationToken: string }>("/auth/email-verification/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMyDashboardApi = (token: string) =>
  request<DashboardResponse>("/dashboard/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateMyDashboardApi = (
  token: string,
  payload: Partial<DashboardResponse["dashboard"]>,
) =>
  request<DashboardResponse>("/dashboard/me", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const getMyEventRegistrationsApi = (token: string) =>
  request<MyEventRegistrationsResponse>("/events/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const registerForEventApi = (token: string, payload: EventRegistrationPayload) =>
  request<EventRegistrationMutationResponse>(`/events/${payload.slug}/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const updateEventRegistrationApi = (
  token: string,
  slug: string,
  payload: { note?: string; status?: "registered" | "attended" | "cancelled" },
) =>
  request<EventRegistrationMutationResponse>(`/events/${slug}/register`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const submitEventInterestApi = (payload: EventInterestPayload) =>
  request<EventInterestResponse>(`/events/${payload.slug}/interest`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getPublicEventsApi = () =>
  request<{ events: DynamicEvent[] }>("/content/events", {
    method: "GET",
  });

export const getPublicEventBySlugApi = (slug: string) =>
  request<{ event: DynamicEvent }>(`/content/events/${slug}`, {
    method: "GET",
  });

export const getPublicBlogsApi = () =>
  request<{ posts: DynamicBlogPost[] }>("/content/blogs", {
    method: "GET",
  });

export const getPublicBlogBySlugApi = (slug: string) =>
  request<{ post: DynamicBlogPost }>(`/content/blogs/${slug}`, {
    method: "GET",
  });

export const getPublicSiteNoticeApi = () =>
  request<{ notice: SiteNotice | null }>("/content/site-notice", {
    method: "GET",
  });

export const getPublicPartnersApi = () =>
  request<{ partners: PartnerLogo[] }>("/content/partners", {
    method: "GET",
  });

export const newsletterSubscribeApi = (payload: { email: string; name?: string }) =>
  request<{ message: string }>("/content/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const newsletterUnsubscribeApi = (email: string) =>
  request<{ message: string }>(`/content/newsletter/unsubscribe?email=${encodeURIComponent(email)}`, {
    method: "GET",
  });

export const submitJoinRequestApi = (payload: JoinRequestPayload) =>
  request<{ ok: boolean; id: string }>('/content/join-us', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getAdminNewsletterSubscribersApi = (token: string) =>
  request<{ subscribers: NewsletterSubscriber[] }>("/admin/newsletter/subscribers", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendAdminNewsletterApi = (
  token: string,
  payload: { subject: string; html: string },
) =>
  request<{
    message: string;
    summary?: {
      total: number;
      sent: number;
      failed: number;
      failures: Array<{ email: string; message: string }>;
    };
  }>("/admin/newsletter/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const sendAdminEmailAutomationApi = (
  token: string,
  payload: { subject: string; html: string; audience: NewsletterAudience },
) =>
  request<{
    message: string;
    summary?: {
      audience?: NewsletterAudience;
      total: number;
      sent: number;
      failed: number;
      failures: Array<{ email: string; message: string }>;
    };
  }>("/admin/email-automation/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

// Templates & Campaigns API
export type EmailTemplate = { _id: string; name: string; subject: string; html: string };

export const getAdminTemplatesApi = (token: string) =>
  request<{ templates: EmailTemplate[] }>("/admin/templates", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminTemplateApi = (token: string, payload: { name: string; subject: string; html: string }) =>
  request<{ message: string; template: EmailTemplate }>("/admin/templates", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const previewAdminTemplateApi = (token: string, payload: { html: string; variables?: Record<string, any> }) =>
  request<{ html: string }>("/admin/templates/preview", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export type Campaign = {
  _id: string;
  name: string;
  subject: string;
  audience: NewsletterAudience;
  status: string;
  html?: string;
  scheduledAt?: string;
  stats: { total: number; sent: number; failed: number };
};

export const createAdminCampaignApi = (token: string, payload: { name?: string; subject: string; html?: string; templateId?: string; audience?: NewsletterAudience; scheduledAt?: string }) =>
  request<{ message: string; campaignId: string; total: number }>("/admin/campaigns", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const getAdminCampaignsApi = (token: string) =>
  request<{ campaigns: Campaign[] }>("/admin/campaigns", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminCampaignLogsApi = (token: string, id: string) =>
  request<{ logs: Array<{ to: string; status: string; error?: string; createdAt: string }> }>(`/admin/campaigns/${id}/logs`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminCampaignApi = (token: string, id: string) =>
  request<{ campaign: Campaign }>(`/admin/campaigns/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminEventsApi = (token: string) =>
  request<{ events: DynamicEvent[] }>("/admin/events", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminEventApi = (token: string, payload: Partial<DynamicEvent>) =>
  request<{ message: string; event: DynamicEvent }>("/admin/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminEventApi = (token: string, slug: string, payload: Partial<DynamicEvent>) =>
  request<{ message: string; event: DynamicEvent }>(`/admin/events/${slug}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteAdminEventApi = (token: string, slug: string) =>
  request<{ message: string }>(`/admin/events/${slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminBlogsApi = (token: string) =>
  request<{ posts: DynamicBlogPost[] }>("/admin/blogs", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminBlogApi = (token: string, payload: Partial<DynamicBlogPost>) =>
  request<{ message: string; post: DynamicBlogPost }>("/admin/blogs", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminBlogApi = (token: string, slug: string, payload: Partial<DynamicBlogPost>) =>
  request<{ message: string; post: DynamicBlogPost }>(`/admin/blogs/${slug}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteAdminBlogApi = (token: string, slug: string) =>
  request<{ message: string }>(`/admin/blogs/${slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminSiteNoticeApi = (token: string) =>
  request<{ notice: SiteNotice | null }>("/admin/site-notice", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAdminSiteNoticeApi = (
  token: string,
  payload: Pick<SiteNotice, "title" | "message" | "buttonLabel" | "buttonUrl" | "isActive">,
) =>
  request<{ message: string; notice: SiteNotice }>("/admin/site-notice", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const getAdminPartnersApi = (token: string) =>
  request<{ partners: PartnerLogo[] }>("/admin/partners", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminPartnerInquiriesApi = (token: string) =>
  request<{ inquiries: PartnerInquiry[] }>("/admin/partner-inquiries", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminJoinRequestsApi = (token: string) =>
  request<{ requests: AdminJoinRequest[] }>("/admin/join-requests", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminPartnerApi = (
  token: string,
  payload: Pick<PartnerLogo, "name" | "logoUrl" | "websiteUrl" | "order" | "isActive">,
) =>
  request<{ message: string; partner: PartnerLogo }>("/admin/partners", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminPartnerApi = (
  token: string,
  id: string,
  payload: Pick<PartnerLogo, "name" | "logoUrl" | "websiteUrl" | "order" | "isActive">,
) =>
  request<{ message: string; partner: PartnerLogo }>(`/admin/partners/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteAdminPartnerApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/partners/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminMembersApi = (token: string) =>
  request<{ members: AdminMember[] }>("/admin/members", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminEventInterestsApi = (token: string) =>
  request<{ interests: AdminEventInterest[] }>("/admin/event-interests", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCloudinaryUploadSignatureApi = (
  token: string,
  payload?: { folder?: string; publicId?: string },
) =>
  request<CloudinarySignedUploadResponse>("/admin/cloudinary/sign-upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload || {}),
  });

// Profile API Functions
export type ProfileResponse = {
  profile: SessionAccount;
};

export type UpdateProfilePayload = {
  headline?: string;
  profilePhoto?: string;
};

export type UpdateProfileResponse = {
  message: string;
  account: SessionAccount;
};

export const getPublicProfileApi = (profileId: string) =>
  request<ProfileResponse>(`/profile/public/${profileId}`, {
    method: "GET",
  });

export const getMyProfileApi = (token: string) =>
  request<{ account: SessionAccount }>("/profile/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateMyProfileApi = (token: string, payload: UpdateProfilePayload) =>
  request<UpdateProfileResponse>("/profile/me", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const generateProfileUrlApi = (token: string) =>
  request<{ profileUrl: string; profileId: string }>("/profile/url/generate", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
