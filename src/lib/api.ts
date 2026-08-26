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
  inviteToken?: string;
};

export type InvestorInvite = {
  _id: string;
  token: string;
  code: string;
  label: string;
  isActive: boolean;
  reusable: boolean;
  expiresAt: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  usedAt: string | null;
  usedByAccountId: string | null;
  createdAt: string;
  updatedAt: string;
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
  mobileBannerImage?: string;
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
  eventName?: string;
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

export type SliderPromotion = {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  buttonLabel: string;
  order: number;
  isActive: boolean;
  createdBy: string;
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

export type AdminInvestorDetail = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  vcName: string;
  investmentInterest: string;
  inviteToken?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminMemberDetail = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: "user" | "founder";
  referralCode?: string;
  referredBy?: string;
  isActive: boolean;
  profileId?: string;
  headline?: string;
  profilePhoto?: string;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  roleDetails: {
    interest?: string;
    occupation?: string;
    experienceLevel?: string;
    startupName?: string;
    startupStage?: string;
    teamSize?: number;
    startupWebsite?: string;
  };
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
  introduction?: string;
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
  status?: "pending" | "approved" | "denied";
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const registerApi = (payload: RegisterPayload) =>
  request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const validateInvestorInviteApi = (token: string) =>
  request<{ valid: boolean; message?: string }>(`/auth/investor-invite/${encodeURIComponent(token)}`, {
    method: "GET",
  });

export const submitInvestorLeadApi = (payload: {
  fullName: string;
  email: string;
  phone?: string;
  vcName: string;
  investmentInterest: string;
  inviteToken: string;
}) =>
  request<{ message: string; lead: AdminInvestorDetail }>("/auth/investor-lead", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const validateInviteByCodeApi = (code: string) =>
  request<{ valid: boolean; message?: string; label?: string }>(`/auth/invite/${encodeURIComponent(code)}`, {
    method: "GET",
  });

export const registerInvestorViaInviteApi = (
  code: string,
  payload: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
    firmName: string;
    sector: string;
  },
) =>
  request<AuthResponse>(`/auth/invite/${encodeURIComponent(code)}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listAdminInvestorInvitesApi = (token: string) =>
  request<{ invites: InvestorInvite[] }>("/admin/investor-invites", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminInvestorInviteApi = (
  token: string,
  payload: { label?: string; expiresInDays?: number; reusable?: boolean },
) =>
  request<{ message: string; invite: InvestorInvite }>("/admin/investor-invites", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const quickAccessInvestorInviteApi = (
  code: string,
  payload: { fullName: string; email: string; phone?: string; city?: string; firmName?: string; sector?: string },
) =>
  request<AuthResponse>(`/auth/access/${encodeURIComponent(code)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAdminInvestorInviteJoinersApi = (token: string, id: string) =>
  request<{ joiners: ActivityInvestorProfile[] }>(`/admin/investor-invites/${id}/joiners`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const revokeAdminInvestorInviteApi = (token: string, id: string) =>
  request<{ message: string; invite: InvestorInvite }>(`/admin/investor-invites/${id}/revoke`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

export const reactivateAdminInvestorInviteApi = (token: string, id: string) =>
  request<{ message: string; invite: InvestorInvite }>(`/admin/investor-invites/${id}/reactivate`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteAdminInvestorInviteApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/investor-invites/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
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

export const getMyEventAttendanceApi = (token: string, slug: string) =>
  request<{ attending: boolean }>(`/content/events/${slug}/attend`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const markEventAttendanceApi = (token: string, slug: string) =>
  request<{ message: string; attending: boolean }>(`/content/events/${slug}/attend`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

export const cancelEventAttendanceApi = (token: string, slug: string) =>
  request<{ message: string; attending: boolean }>(`/content/events/${slug}/attend`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export type MyAttendedEvent = { eventSlug: string; eventTitle: string; registeredAt: string };

export const getMyAttendedEventsApi = (token: string) =>
  request<{ events: MyAttendedEvent[]; count: number }>("/content/events/mine", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
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

export const getPublicSliderPromotionsApi = () =>
  request<{ promotions: SliderPromotion[] }>("/content/slider-promotions", {
    method: "GET",
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

export const createAdminGalleryApi = async (
  token: string,
  payload: Pick<GalleryImage, "title" | "eventName" | "imageUrl" | "altText" | "caption" | "linkUrl" | "order" | "isActive">,
) =>
  request<{ message: string; image: GalleryImage }>("/admin/gallery", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminGalleryApi = async (
  token: string,
  id: string,
  payload: Pick<GalleryImage, "title" | "eventName" | "imageUrl" | "altText" | "caption" | "linkUrl" | "order" | "isActive">,
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

export const getAdminSliderPromotionsApi = (token: string) =>
  request<{ promotions: SliderPromotion[] }>("/admin/slider-promotions", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminSliderPromotionApi = (
  token: string,
  payload: Pick<SliderPromotion, "title" | "description" | "imageUrl" | "altText" | "linkUrl" | "buttonLabel" | "order" | "isActive" | "createdBy">,
) =>
  request<{ message: string; promotion: SliderPromotion }>("/admin/slider-promotions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminSliderPromotionApi = (
  token: string,
  id: string,
  payload: Pick<SliderPromotion, "title" | "description" | "imageUrl" | "altText" | "linkUrl" | "buttonLabel" | "order" | "isActive" | "createdBy">,
) =>
  request<{ message: string; promotion: SliderPromotion }>(`/admin/slider-promotions/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteAdminSliderPromotionApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/slider-promotions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminPartnerInquiriesApi = (token: string) =>
  request<{ inquiries: PartnerInquiry[] }>("/admin/partner-inquiries", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateAdminPartnerInquiryStatusApi = (
  token: string,
  id: string,
  status: "pending" | "approved" | "rejected",
) =>
  request<{ message: string; inquiry: PartnerInquiry }>(`/admin/partner-inquiries/${id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
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

export const updateAdminJoinRequestStatusApi = (
  token: string,
  id: string,
  status: "pending" | "approved" | "denied",
) =>
  request<{ message: string; request: AdminJoinRequest }>(`/admin/join-requests/${id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
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

export const getAdminInvestorsDirectoryApi = (token: string) =>
  request<{ investors: AdminInvestorDetail[] }>("/admin/investors-directory", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAdminMembersDirectoryApi = (token: string) =>
  request<{ members: AdminMemberDetail[] }>("/admin/members-directory", {
    method: "GET",
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

// --- BANGALORE EVENT ACTIVITY API & LOCAL STORAGE ---

import { type RatingCriterionKey, RATING_CRITERIA_COUNT, sumRatingScores } from "./rating-criteria";

export type RatingScores = Record<RatingCriterionKey, number>;

export type ActivityRatingItem = {
  investorId: string;
  investorName: string;
  investorFirm?: string;
  investorPhoto?: string;
  scores: RatingScores;
  totalScore: number; // out of RATING_MAX_TOTAL (9 criteria x 10)
  comment?: string;
  feedbackImageUrl?: string;
  voiceNoteUrl?: string;
  updatedAt: string;
};

export type ActivityStartupItem = {
  id: string;
  founderName: string;
  founderEmail: string;
  founderPhone?: string;
  startupName: string;
  tagline: string;
  description: string;
  category: string;
  stage: string;
  location: string;
  pitchDeckUrl: string;
  logoUrl: string;
  ratings: ActivityRatingItem[];
  averageScore: number; // 0 to 10 scale (average per criterion)
  totalRatingsCount: number;
  resultRank?: "gold" | "silver" | "bronze" | null;
  createdAt: string;
};

export type ActivityInvestorProfile = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  firmName: string;
  designation: string;
  sectors: string[];
  ticketSize?: string;
  linkedin?: string;
  bio?: string;
  photoUrl: string;
  promoCodeUsed: string;
};

const INITIAL_BANGALORE_STARTUPS: ActivityStartupItem[] = [
  {
    id: "blr-startup-1",
    founderName: "Aarav Sharma",
    founderEmail: "aarav@nexaaihealth.in",
    founderPhone: "+91 98765 43210",
    startupName: "NexaAI Health",
    tagline: "AI-driven predictive diagnostic tools for Indian multispecialty hospitals.",
    description: "NexaAI builds proprietary deep-learning vision models that assist radiologists in detecting early-stage pulmonary & cardiac abnormalities 4x faster.",
    category: "HealthTech & AI",
    stage: "Seed",
    location: "Bangalore",
    pitchDeckUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    logoUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80",
    ratings: [
      {
        investorId: "inv-demo-1",
        investorName: "Vikram Mehta",
        investorFirm: "Apex Venture Partners",
        investorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        scores: {
          market: 8, traction: 10, pitch: 8,
          problemClarity: 9, solutionViability: 9, qna: 8, mvpFit: 9,
        },
        totalScore: 61,
        comment: "Outstanding tech stack and strong team execution in Bangalore ecosystem.",
        updatedAt: new Date().toISOString(),
      },
    ],
    averageScore: 8.71,
    totalRatingsCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "blr-startup-2",
    founderName: "Priya Sundaram",
    founderEmail: "priya@finedgepay.com",
    founderPhone: "+91 91234 56789",
    startupName: "FinEdge Pay",
    tagline: "UPI-integrated instant micro-credit for tier-2/3 micro-merchants.",
    description: "Enabling quick 14-day working capital loans for small retailers using real-time UPI transaction intelligence and localized credit scoring.",
    category: "FinTech",
    stage: "Pre-Seed",
    location: "Bangalore",
    pitchDeckUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    logoUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&auto=format&fit=crop&q=80",
    ratings: [
      {
        investorId: "inv-demo-1",
        investorName: "Vikram Mehta",
        investorFirm: "Apex Venture Partners",
        investorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        scores: {
          market: 10, traction: 8, pitch: 8,
          problemClarity: 8, solutionViability: 8, qna: 7, mvpFit: 8,
        },
        totalScore: 57,
        comment: "Huge addressable market with clear monetization path.",
        updatedAt: new Date().toISOString(),
      },
    ],
    averageScore: 8.14,
    totalRatingsCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "blr-startup-3",
    founderName: "Rohan Varma",
    founderEmail: "rohan@urbanvoltev.com",
    founderPhone: "+91 99887 76655",
    startupName: "UrbanVolt EV",
    tagline: "Ultra-fast 90-second battery swapping grid for EV delivery fleets.",
    description: "Operating 40+ automated battery swapping hubs across East & South Bangalore, powering 3,000+ last-mile delivery riders daily.",
    category: "CleanTech & EV",
    stage: "Series A",
    location: "Bangalore",
    pitchDeckUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    logoUrl: "https://images.unsplash.com/photo-1558441719-443b38645ad9?w=300&auto=format&fit=crop&q=80",
    ratings: [],
    averageScore: 0,
    totalRatingsCount: 0,
    createdAt: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_STARTUPS_KEY = "fc_bangalore_activity_startups_v1";
const LOCAL_STORAGE_INVESTOR_KEY = "fc_bangalore_activity_investor_v1";

export const getBangaloreStartupsLocal = (): ActivityStartupItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STARTUPS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_STARTUPS_KEY, JSON.stringify(INITIAL_BANGALORE_STARTUPS));
      return INITIAL_BANGALORE_STARTUPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BANGALORE_STARTUPS;
  } catch {
    return INITIAL_BANGALORE_STARTUPS;
  }
};

export const saveBangaloreStartupLocal = (startupData: Omit<ActivityStartupItem, "id" | "ratings" | "averageScore" | "totalRatingsCount" | "createdAt">): ActivityStartupItem => {
  const existing = getBangaloreStartupsLocal();
  const newStartup: ActivityStartupItem = {
    ...startupData,
    id: `blr-startup-${Date.now()}`,
    ratings: [],
    averageScore: 0,
    totalRatingsCount: 0,
    createdAt: new Date().toISOString(),
  };
  const updated = [newStartup, ...existing];
  localStorage.setItem(LOCAL_STORAGE_STARTUPS_KEY, JSON.stringify(updated));
  return newStartup;
};

export const submitStartupRatingLocal = (
  startupId: string,
  investor: ActivityInvestorProfile,
  scores: RatingScores,
  comment?: string
): ActivityStartupItem[] => {
  const startups = getBangaloreStartupsLocal();
  const updated = startups.map((s) => {
    if (s.id !== startupId) return s;

    const totalScore = sumRatingScores(scores);
    const newRating: ActivityRatingItem = {
      investorId: investor.id,
      investorName: investor.fullName,
      investorFirm: investor.firmName,
      investorPhoto: investor.photoUrl,
      scores,
      totalScore,
      comment: comment || "",
      updatedAt: new Date().toISOString(),
    };

    const existingRatings = s.ratings.filter((r) => r.investorId !== investor.id);
    const newRatings = [...existingRatings, newRating];
    const totalScoreSum = newRatings.reduce((acc, curr) => acc + curr.totalScore / RATING_CRITERIA_COUNT, 0);
    const avgScore = Number((totalScoreSum / newRatings.length).toFixed(2));

    return {
      ...s,
      ratings: newRatings,
      averageScore: avgScore,
      totalRatingsCount: newRatings.length,
    };
  });

  // Sort startups by average score descending
  updated.sort((a, b) => b.averageScore - a.averageScore || b.totalRatingsCount - a.totalRatingsCount);
  localStorage.setItem(LOCAL_STORAGE_STARTUPS_KEY, JSON.stringify(updated));
  return updated;
};

export const saveInvestorProfileLocal = (investorData: Omit<ActivityInvestorProfile, "id">): ActivityInvestorProfile => {
  const investorProfile: ActivityInvestorProfile = {
    ...investorData,
    id: `inv-${Date.now()}`,
  };
  localStorage.setItem(LOCAL_STORAGE_INVESTOR_KEY, JSON.stringify(investorProfile));
  return investorProfile;
};

export const getSavedInvestorProfileLocal = (): ActivityInvestorProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INVESTOR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// --- REAL-TIME BACKEND API CONNECTORS WITH MONGODB & SYNC ---

// Pass the viewer's auth token (if any) so the backend can include founderPhone for logged-in
// members — anonymous callers get every field except that one.
export const getBangaloreStartupsApi = async (token?: string | null): Promise<ActivityStartupItem[]> => {
  try {
    const res = await request<{ startups: ActivityStartupItem[] }>("/activity/startups", {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res?.startups && Array.isArray(res.startups)) {
      // A successful response — including an empty list (e.g. all startups deleted) — is the source of truth.
      // Map MongoDB _id to id if needed
      const mapped = res.startups.map((item: any) => ({
        ...item,
        id: item.id || item._id || `blr-${Math.random()}`,
      }));
      localStorage.setItem(LOCAL_STORAGE_STARTUPS_KEY, JSON.stringify(mapped));
      return mapped;
    }
  } catch {
    // Only fall back to the local cache when the request itself failed.
  }
  return getBangaloreStartupsLocal();
};

// A founder gets exactly one Bangalore Activity registration — the backend rejects a second
// submission under the same email with 409 + code "ALREADY_REGISTERED" (and hands back the
// existing registration's accessToken) instead of creating a duplicate directory entry.
export type RegisterBangaloreStartupResult =
  | { status: "created"; startup: ActivityStartupItem & { accessToken?: string; token?: string; account?: SessionAccount } }
  | { status: "duplicate"; accessToken?: string; message: string };

export const registerBangaloreStartupApi = async (
  startupData: Omit<ActivityStartupItem, "id" | "ratings" | "averageScore" | "totalRatingsCount" | "createdAt">
): Promise<RegisterBangaloreStartupResult> => {
  const response = await fetch(`${API_BASE_URL}/activity/startup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...startupData, promoCode: "startup20" }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    code?: string;
    accessToken?: string;
    token?: string;
    account?: SessionAccount;
    startup?: ActivityStartupItem;
  };

  if (response.status === 409 && data.code === "ALREADY_REGISTERED") {
    return { status: "duplicate", accessToken: data.accessToken, message: data.message || "You've already registered." };
  }

  if (!response.ok || !data.startup) {
    throw new Error(data.message || "Failed to register startup.");
  }

  const localSaved = saveBangaloreStartupLocal(startupData);
  return {
    status: "created",
    startup: {
      ...data.startup,
      id: (data.startup as any)._id || data.startup.id || localSaved.id,
      accessToken: data.accessToken,
      token: data.token,
      account: data.account,
    },
  };
};

// Update the founder's own already-registered startup profile — the only path a founder has
// back into their Bangalore Activity entry once registered (email is not editable here; it's
// the identity the duplicate check above keys off).
export const updateBangaloreStartupApi = async (
  accessToken: string,
  startupData: Pick<
    ActivityStartupItem,
    "founderName" | "founderPhone" | "startupName" | "tagline" | "description" | "category" | "stage" | "pitchDeckUrl" | "logoUrl"
  >
): Promise<ActivityStartupItem> => {
  const res = await request<{ startup: ActivityStartupItem }>(`/activity/startup/access/${encodeURIComponent(accessToken)}`, {
    method: "PUT",
    body: JSON.stringify(startupData),
  });
  return { ...res.startup, id: (res.startup as any)._id || res.startup.id };
};

export const saveInvestorProfileApi = async (
  investorData: Omit<ActivityInvestorProfile, "id">
): Promise<ActivityInvestorProfile & { token?: string; account?: SessionAccount }> => {
  const localSaved = saveInvestorProfileLocal(investorData);
  try {
    const res = await request<{ investor: ActivityInvestorProfile; token?: string; account?: SessionAccount }>("/activity/investor", {
      method: "POST",
      body: JSON.stringify({ ...investorData, promoCode: "investor20" }),
    });
    if (res?.investor) {
      const serverInvestor = {
        ...res.investor,
        id: (res.investor as any)._id || res.investor.id || localSaved.id,
        token: res.token,
        account: res.account,
      };
      saveInvestorProfileLocal(serverInvestor);
      return serverInvestor;
    }
  } catch {
    // Retain local copy if server fails
  }
  return localSaved;
};

export const submitStartupRatingApi = async (
  startupId: string,
  investor: ActivityInvestorProfile,
  scores: RatingScores,
  comment?: string
): Promise<ActivityStartupItem[]> => {
  const localUpdated = submitStartupRatingLocal(startupId, investor, scores, comment);
  try {
    await request("/activity/rate", {
      method: "POST",
      body: JSON.stringify({
        startupId,
        investorId: investor.id,
        investorName: investor.fullName,
        investorFirm: investor.firmName,
        investorPhoto: investor.photoUrl,
        scores,
        comment,
      }),
    });
    // Refresh live list from server
    return await getBangaloreStartupsApi();
  } catch {
    // Fallback to local updated list
  }
  return localUpdated;
};

export const getBangaloreInvestorsApi = async (): Promise<ActivityInvestorProfile[]> => {
  try {
    const res = await request<{ investors: ActivityInvestorProfile[] }>("/activity/investors", { method: "GET" });
    if (res?.investors && Array.isArray(res.investors)) {
      return res.investors.map((item: any) => ({
        ...item,
        id: item.id || item._id || `inv-${Math.random()}`,
      }));
    }
  } catch {
    // Silently return empty
  }
  return [];
};

export const deleteAdminActivityStartupApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/activity/startups/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteAdminActivityInvestorApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/activity/investors/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const announceAdminActivityResultsApi = (
  token: string,
  picks: { goldId?: string | null; silverId?: string | null; bronzeId?: string | null },
) =>
  request<{ message: string }>("/admin/activity/results", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(picks),
  });

export const resetAdminActivityResultsApi = (token: string) =>
  request<{ message: string }>("/admin/activity/results", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

// --- Settings: password, privacy, notifications, deactivation ---

export const changePasswordApi = (token: string, payload: { currentPassword: string; newPassword: string }) =>
  request<{ message: string }>("/profile/change-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updatePrivacyApi = (token: string, isProfilePublic: boolean) =>
  request<{ message: string; account: SessionAccount }>("/profile/privacy", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isProfilePublic }),
  });

export const updateNotificationPrefsApi = (
  token: string,
  payload: { productUpdates?: boolean; communityActivity?: boolean },
) =>
  request<{ message: string; account: SessionAccount }>("/profile/notifications", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deactivateAccountApi = (token: string) =>
  request<{ message: string }>("/profile/deactivate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

// --- Community: private feed + direct messages between members ---

export type CommunityComment = {
  _id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorPhoto?: string;
  content: string;
  createdAt: string;
};

export type CommunityPost = {
  _id: string;
  authorId: string;
  authorName: string;
  authorRole: "user" | "investor" | "founder" | "admin" | "superadmin";
  authorPhoto?: string;
  authorHeadline?: string;
  content: string;
  imageUrl?: string;
  likeCount: number;
  likedByMe: boolean;
  comments: CommunityComment[];
  createdAt: string;
  updatedAt: string;
};

export const getCommunityFeedApi = (token: string, before?: string) =>
  request<{ posts: CommunityPost[] }>(`/community/posts${before ? `?before=${encodeURIComponent(before)}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createCommunityPostApi = (token: string, payload: { content: string; imageUrl?: string }) =>
  request<{ message: string; post: CommunityPost }>("/community/posts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteCommunityPostApi = (token: string, id: string) =>
  request<{ message: string }>(`/community/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export const toggleCommunityLikeApi = (token: string, id: string) =>
  request<{ post: CommunityPost }>(`/community/posts/${id}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

export const addCommunityCommentApi = (token: string, id: string, content: string) =>
  request<{ post: CommunityPost }>(`/community/posts/${id}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });

export const deleteCommunityCommentApi = (token: string, id: string, commentId: string) =>
  request<{ post: CommunityPost }>(`/community/posts/${id}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export type CommunityConversation = {
  userId: string;
  fullName: string;
  role: string;
  profilePhoto?: string;
  headline?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type CommunityDirectMessage = {
  _id: string;
  participants: string[];
  senderId: string;
  recipientId: string;
  text: string;
  readAt: string | null;
  createdAt: string;
};

export const listCommunityConversationsApi = (token: string) =>
  request<{ conversations: CommunityConversation[] }>("/community/messages", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getCommunityThreadApi = (token: string, userId: string) =>
  request<{
    participant: { userId: string; fullName: string; role: string; profilePhoto?: string; headline?: string };
    messages: CommunityDirectMessage[];
  }>(`/community/messages/${userId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendCommunityMessageApi = (token: string, userId: string, text: string) =>
  request<{ message: CommunityDirectMessage }>(`/community/messages/${userId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text }),
  });

// --- Community: member directory (founders & investors) + follow ---

export type DirectoryMember = {
  id: string;
  fullName: string;
  role: "founder" | "investor";
  city?: string;
  headline?: string;
  profilePhoto?: string;
  profileId: string;
  company?: string;
  followersCount: number;
  isFollowing: boolean;
};

export const getCommunityDirectoryApi = (
  token: string,
  params: { role?: "all" | "founder" | "investor"; search?: string; page?: number } = {},
) => {
  const query = new URLSearchParams();
  if (params.role && params.role !== "all") query.set("role", params.role);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  const qs = query.toString();

  return request<{ members: DirectoryMember[]; page: number; hasMore: boolean; total: number }>(
    `/community/directory${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: { Authorization: `Bearer ${token}` } },
  );
};

export const toggleFollowApi = (token: string, userId: string) =>
  request<{ isFollowing: boolean; followersCount: number }>(`/community/follow/${userId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

// --- Matchmaking: founder <-> investor swipe matching (premium members only) ---

export type MatchCandidate = {
  id: string;
  fullName: string;
  role: "founder" | "investor";
  city?: string;
  headline?: string;
  profilePhoto?: string;
  profileId: string;
  roleDetails?: Record<string, any>;
  matchScore: number;
};

export type MatchmakingMatch = {
  id: string;
  matchedAt: string;
  user: Omit<MatchCandidate, "matchScore">;
};

export const getMatchmakingDeckApi = (token: string, limit = 10) =>
  request<{ deck: MatchCandidate[] }>(`/matchmaking/deck?limit=${limit}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const swipeMatchmakingApi = (token: string, targetUserId: string, action: "like" | "pass") =>
  request<{ matched: boolean; match?: { id: string; matchedAt: string; user: MatchmakingMatch["user"] } }>(
    "/matchmaking/swipe",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetUserId, action }),
    },
  );

export const listMatchmakingMatchesApi = (token: string) =>
  request<{ matches: MatchmakingMatch[] }>("/matchmaking/matches", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

// --- Cookie consent: log the banner choice, admin can monitor accept/deny stats ---

export const logCookieConsentApi = (
  payload: { visitorId: string; choice: "accepted" | "denied"; path: string },
  token?: string | null,
) =>
  request<{ ok: boolean }>("/consent/log", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload),
  });

export type CookieConsentLogEntry = {
  id: string;
  choice: "accepted" | "denied";
  path?: string;
  userAgent?: string;
  account: { id: string; fullName: string; email: string; role: string } | null;
  createdAt: string;
};

export type CookieConsentStats = {
  totalAccepted: number;
  totalDenied: number;
  total: number;
  acceptRate: number;
  recent: CookieConsentLogEntry[];
  daily: Array<{ date: string; accepted: number; denied: number }>;
};

export const getAdminCookieConsentApi = (token: string) =>
  request<CookieConsentStats>("/admin/cookie-consent", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

// --- SAIS'26 Room: founder access, authenticated room ratings, public leaderboard ---

export type FounderAccessResponse = {
  startup: ActivityStartupItem;
  rank: number | null;
};

export const getMyFounderAccessApi = (token: string) =>
  request<{ accessToken: string; startupName: string }>("/activity/startup/my-access", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const getFounderAccessDashboardApi = (accessToken: string) =>
  request<FounderAccessResponse>(`/activity/startup/access/${encodeURIComponent(accessToken)}`, {
    method: "GET",
  });

export type InvestorAccessResponse = {
  investor: ActivityInvestorProfile;
};

export const getInvestorAccessDashboardApi = (accessToken: string) =>
  request<InvestorAccessResponse>(`/activity/investor/access/${encodeURIComponent(accessToken)}`, {
    method: "GET",
  });

export const submitRoomRatingApi = (
  token: string,
  payload: {
    startupId: string;
    scores: RatingScores;
    comment?: string;
    feedbackImageUrl?: string;
    voiceNoteUrl?: string;
  },
) =>
  request<{ message: string; startup: ActivityStartupItem }>("/activity/room/rate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

// Transcribes an uploaded voice note (Cloudinary URL) to text via Groq Whisper.
export const transcribeVoiceNoteApi = (token: string, audioUrl: string) =>
  request<{ text: string }>("/ai/transcribe", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ audioUrl }),
  });

export type PublicLeaderboardStartup = {
  rank: number;
  startupName: string;
  tagline: string;
  category: string;
  stage: string;
  logoUrl: string;
  averageScore: number;
  totalRatingsCount: number;
};

export const getPublicTopStartupsApi = () =>
  request<{ startups: PublicLeaderboardStartup[] }>("/activity/leaderboard/top", {
    method: "GET",
  });

// --- Admin team management, audit log, and admin chat ---

export type AdminAccountSummary = {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "superadmin";
  isActive: boolean;
  assignedTasks?: string[];
};

export type CreateAdminResponse = {
  message: string;
  account: AdminAccountSummary;
  generatedPassword: string;
  emailSent: boolean;
};

export const listAdminsApi = (token: string) =>
  request<{ admins: AdminAccountSummary[] }>("/admin/super/admins", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminApi = (
  token: string,
  payload: { fullName: string; email: string; phone: string; city: string; role: "admin" | "superadmin" },
) =>
  request<CreateAdminResponse>("/admin/super/admins", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminRoleApi = (token: string, id: string, role: "admin" | "superadmin") =>
  request<{ message: string; account: AdminAccountSummary }>(`/admin/super/admins/${id}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role }),
  });

export const deleteAdminAccountApi = (token: string, id: string, hard = false) =>
  request<{ message: string }>(`/admin/super/admins/${id}${hard ? "?hard=true" : ""}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export type AuditLogEntry = {
  _id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  method: string;
  path: string;
  targetCollection: string;
  targetId: string | null;
  statusCode: number | null;
  changes?: Record<string, unknown>;
  createdAt: string;
};

export const listAuditLogsApi = (token: string, limit = 200) =>
  request<{ logs: AuditLogEntry[] }>(`/admin/super/audit-logs?limit=${limit}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export type AdminChatMessage = {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "superadmin";
  message: string;
  mentions?: string[];
  createdAt: string;
};

export type ChatParticipant = {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "superadmin";
};

export const listChatParticipantsApi = (token: string) =>
  request<{ participants: ChatParticipant[] }>("/admin/chat/participants", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const listAdminChatMessagesApi = (token: string, after?: string) =>
  request<{ messages: AdminChatMessage[] }>(`/admin/chat/messages${after ? `?after=${encodeURIComponent(after)}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const sendAdminChatMessageApi = (token: string, message: string, senderName?: string, mentionedIds?: string[]) =>
  request<{ chatMessage: AdminChatMessage }>("/admin/chat/messages", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message, senderName, mentionedIds }),
  });

export type AdminTaskPerson = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
};

export type AdminTask = {
  _id: string;
  title: string;
  description: string;
  assignedTo: AdminTaskPerson | null;
  createdBy: AdminTaskPerson | null;
  status: "open" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const listTasksApi = (token: string, filters?: { assignedTo?: string; status?: string }) => {
  const params = new URLSearchParams();
  if (filters?.assignedTo) params.set("assignedTo", filters.assignedTo);
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString();

  return request<{ tasks: AdminTask[] }>(`/admin/super/tasks${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createTaskApi = (
  token: string,
  payload: { title: string; description?: string; priority?: "low" | "medium" | "high"; dueAt?: string },
) =>
  request<{ message: string; task: AdminTask }>("/admin/super/tasks", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const assignTaskApi = (token: string, id: string, assignedTo: string | null) =>
  request<{ message: string; task: AdminTask }>(`/admin/super/tasks/${id}/assign`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ assignedTo }),
  });

export const updateTaskStatusApi = (token: string, id: string, status: "open" | "in_progress" | "done") =>
  request<{ message: string; task: AdminTask }>(`/admin/super/tasks/${id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });

export const deleteTaskApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/super/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export type TeamMember = {
  _id: string;
  name: string;
  role: string;
  imageUrl: string;
  linkedinUrl?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const getPublicTeamMembersApi = () =>
  request<{ members: TeamMember[] }>("/content/team");

export const getAdminTeamMembersApi = (token: string) =>
  request<{ members: TeamMember[] }>("/admin/team", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminTeamMemberApi = (token: string, payload: Partial<TeamMember>) =>
  request<{ message: string; member: TeamMember }>("/admin/team", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const updateAdminTeamMemberApi = (token: string, id: string, payload: Partial<TeamMember>) =>
  request<{ message: string; member: TeamMember }>(`/admin/team/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

export const deleteAdminTeamMemberApi = (token: string, id: string) =>
  request<{ message: string }>(`/admin/team/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

