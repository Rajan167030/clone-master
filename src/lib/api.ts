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
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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
  referredBy?: string;
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
  featuredOnSlider?: boolean;
  sliderOrder?: number;
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

export type GalleryImage = {
  _id: string;
  title: string;
  imageUrl: string;
  altText?: string;
  caption?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Testimonial = {
  _id: string;
  name: string;
  role: string;
  initials?: string;
  quote: string;
  avatarUrl?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export type NewsletterAudience = "subscribers" | "members" | "everyone" | "custom";

export type RecipientUploadStats = {
  totalParsed: number;
  accepted: number;
  invalid: number;
  duplicates: number;
  source?: string;
  previewInvalid?: string[];
};

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
  bannerImage?: string;
  buttonLabel: string;
  buttonUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PartnerLogo = {
  _id: string;
  name: string;
  category?: "general" | "college" | "ecell" | "sponsor";
  logoUrl: string;
  websiteUrl: string;
  logoWidth?: string;
  logoHeight?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SpeakerInvestorProfile = {
  _id: string;
  slug: string;
  category: "speaker" | "investor";
  name: string;
  designation: string;
  company?: string;
  photoUrl?: string;
  photoAlt?: string;
  summary?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
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
  collegeName?: string;
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
  collegeName?: string;
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

export const adminLoginApi = (payload: { email: string; password: string }) =>
  request<AuthResponse>("/auth/admin-login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const forgotPasswordApi = (payload: { email: string }) =>
  request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifyForgotPasswordOtpApi = (payload: { email: string; otp: string }) =>
  request<{ message: string }>("/auth/verify-forgot-password-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const resetPasswordApi = (payload: { email: string; otp: string; newPassword: string }) =>
  request<{ message: string }>("/auth/reset-password", {
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



export const getPublicEventsApi = () =>
  request<{ events: DynamicEvent[] }>("/content/events", {
    method: "GET",
  });

export const getPublicSliderEventsApi = () =>
  request<{ events: DynamicEvent[] }>("/content/events/slider", {
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

export const getPublicGalleryApi = () =>
  request<{ images: GalleryImage[] }>("/content/gallery", {
    method: "GET",
  });

export const getPublicTestimonialsApi = () =>
  request<{ testimonials: Testimonial[] }>("/content/testimonials", {
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

export const getPublicSpeakerInvestorProfilesApi = () =>
  request<{ profiles: SpeakerInvestorProfile[] }>("/content/speakers-investors", {
    method: "GET",
  });

export const getPublicPartnerTypesApi = () =>
  request<{ types: { slug: string; name: string }[] }>("/content/partner-types", {
    method: "GET",
  });

export const getPublicCloudinaryUploadSignatureApi = (
  payload?: { folder?: string; publicId?: string; resourceType?: string },
) =>
  request<CloudinarySignedUploadResponse>("/content/cloudinary/sign-upload", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });

export type FundingApplicationPayload = {
  name: string;
  mobile: string;
  email: string;
  address: string;
  startupName: string;
  startupLink?: string;
  sector?: string;
  sectorOther?: string;
  mrr?: string;
  mrrOther?: string;
  brief: string;
  pitchDeckUrl?: string;
  pitchDeckName?: string;
  problem: string;
  solution: string;
  targetCustomers: string;
  revenue6Months?: string;
  growthRate?: string;
  payingCustomers?: string;
  raisedBefore?: string;
  raisedDetails?: string;
  raiseAmountRange?: string;
  stage?: string;
  agreeAccurate: boolean;
  agreePromo: boolean;
};

export type FundingApplication = FundingApplicationPayload & {
  _id: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  createdAt: string;
};

export const submitFundingApplicationApi = (payload: FundingApplicationPayload) =>
  request<{ ok: boolean; id: string }>("/content/get-funding", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const newsletterSubscribeApi = (payload: { email: string; name?: string; emailVerificationToken: string }) =>
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
  payload: {
    subject: string;
    html: string;
    audience: NewsletterAudience;
    recipientsText?: string;
    recipients?: Array<{ email: string; name?: string } | string>;
  },
) =>
  request<{
    message: string;
    summary?: {
      audience?: NewsletterAudience;
      total: number;
      sent: number;
      failed: number;
      failures: Array<{ email: string; message: string }>;
      recipientUpload?: RecipientUploadStats;
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
  recipientUpload?: RecipientUploadStats;
};

export const createAdminCampaignApi = (
  token: string,
  payload: {
    name?: string;
    subject: string;
    html?: string;
    templateId?: string;
    audience?: NewsletterAudience;
    scheduledAt?: string;
    recipientsText?: string;
    recipients?: Array<{ email: string; name?: string } | string>;
  },
) =>
  request<{ message: string; campaignId: string; total: number; recipientUpload?: RecipientUploadStats }>("/admin/campaigns", {
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

export const getAdminGalleryApi = (token: string) =>
  request<{ images: GalleryImage[] }>("/admin/gallery", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminGalleryApi = (
  token: string,
  payload: Pick<GalleryImage, "title" | "imageUrl" | "altText" | "caption" | "linkUrl" | "order" | "isActive">,
) =>
  request<{ message: string; image: GalleryImage }>("/admin/gallery", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminGalleryApi = (
  token: string,
  id: string,
  payload: Pick<GalleryImage, "title" | "imageUrl" | "altText" | "caption" | "linkUrl" | "order" | "isActive">,
) =>
  request<{ message: string; image: GalleryImage }>(`/admin/gallery/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteAdminGalleryApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/gallery/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminTestimonialsApi = (token: string) =>
  request<{ testimonials: Testimonial[] }>("/admin/testimonials", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminTestimonialApi = (
  token: string,
  payload: Pick<Testimonial, "name" | "role" | "initials" | "quote" | "avatarUrl" | "order" | "isActive">,
) =>
  request<{ message: string; testimonial: Testimonial }>("/admin/testimonials", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminTestimonialApi = (
  token: string,
  id: string,
  payload: Pick<Testimonial, "name" | "role" | "initials" | "quote" | "avatarUrl" | "order" | "isActive">,
) =>
  request<{ message: string; testimonial: Testimonial }>(`/admin/testimonials/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteAdminTestimonialApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/testimonials/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminPartnerInquiriesApi = (token: string) =>
  request<{ inquiries: PartnerInquiry[] }>("/admin/partner-inquiries", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminPartnerTypesApi = (token: string) =>
  request<{ types: { slug: string; name: string }[] }>("/admin/partner-types", {
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
  payload: Pick<PartnerLogo, "name" | "category" | "logoUrl" | "websiteUrl" | "logoWidth" | "logoHeight" | "order" | "isActive">,
) =>
  request<{ message: string; partner: PartnerLogo }>("/admin/partners", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminPartnerApi = (
  token: string,
  id: string,
  payload: Pick<PartnerLogo, "name" | "category" | "logoUrl" | "websiteUrl" | "logoWidth" | "logoHeight" | "order" | "isActive">,
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

export const getAdminSpeakerInvestorProfilesApi = (token: string) =>
  request<{ profiles: SpeakerInvestorProfile[] }>("/admin/speaker-investors", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminSpeakerInvestorProfileApi = (
  token: string,
  payload: Pick<SpeakerInvestorProfile, "slug" | "category" | "name" | "designation" | "company" | "photoUrl" | "photoAlt" | "summary" | "linkedinUrl" | "websiteUrl" | "order" | "isActive">,
) =>
  request<{ message: string; profile: SpeakerInvestorProfile }>("/admin/speaker-investors", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminSpeakerInvestorProfileApi = (
  token: string,
  slug: string,
  payload: Pick<SpeakerInvestorProfile, "slug" | "category" | "name" | "designation" | "company" | "photoUrl" | "photoAlt" | "summary" | "linkedinUrl" | "websiteUrl" | "order" | "isActive">,
) =>
  request<{ message: string; profile: SpeakerInvestorProfile }>(`/admin/speaker-investors/${slug}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteAdminSpeakerInvestorProfileApi = (token: string, slug: string) =>
  request<{ message: string }>(`/admin/speaker-investors/${slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminMembersApi = (token: string) =>
  request<{ members: AdminMember[] }>("/admin/members", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminMemberApi = (
  token: string,
  payload: { fullName: string; email: string; password?: string; phone?: string; city: string; role: string; roleDetails?: Record<string, unknown> },
) =>
  request<{ message: string; member: AdminMember }>("/admin/members", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

export const deleteAdminMemberApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/members/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const getAdminEventInterestsApi = (token: string) =>
  request<{ interests: AdminEventInterest[] }>("/admin/event-interests", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminFundingApplicationsApi = (token: string) =>
  request<{ applications: FundingApplication[] }>("/admin/funding-applications", {
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
  cardColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    backgroundColor?: string;
  };
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
