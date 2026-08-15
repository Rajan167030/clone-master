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
  label: string;
  isActive: boolean;
  expiresAt: string | null;
  usageCount: number;
  lastUsedAt: string | null;
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
  city: string;
  role: "investor";
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
    investmentRange?: { min: number; max: number; currency: string };
    focusSector?: string[];
    portfolioSize?: number;
    investorId?: string;
  };
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
  status?: string;
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

export const listAdminInvestorInvitesApi = (token: string) =>
  request<{ invites: InvestorInvite[] }>("/admin/investor-invites", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

export const createAdminInvestorInviteApi = (
  token: string,
  payload: { label?: string; expiresInDays?: number },
) =>
  request<{ message: string; invite: InvestorInvite }>("/admin/investor-invites", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
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

export type RatingScores = {
  innovation: number;
  market: number;
  traction: number;
  team: number;
  pitch: number;
};

export type ActivityRatingItem = {
  investorId: string;
  investorName: string;
  investorFirm?: string;
  investorPhoto?: string;
  scores: RatingScores;
  totalScore: number; // out of 25
  comment?: string;
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
  averageScore: number; // 0 to 5 scale
  totalRatingsCount: number;
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
        scores: { innovation: 5, market: 4, traction: 5, team: 5, pitch: 4 },
        totalScore: 23,
        comment: "Outstanding tech stack and strong team execution in Bangalore ecosystem.",
        updatedAt: new Date().toISOString(),
      },
    ],
    averageScore: 4.6,
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
        scores: { innovation: 4, market: 5, traction: 4, team: 4, pitch: 4 },
        totalScore: 21,
        comment: "Huge addressable market with clear monetization path.",
        updatedAt: new Date().toISOString(),
      },
    ],
    averageScore: 4.2,
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

    const totalScore = scores.innovation + scores.market + scores.traction + scores.team + scores.pitch;
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
    const totalScoreSum = newRatings.reduce((acc, curr) => acc + curr.totalScore / 5, 0);
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

export const getBangaloreStartupsApi = async (): Promise<ActivityStartupItem[]> => {
  try {
    const res = await request<{ startups: ActivityStartupItem[] }>("/activity/startups", { method: "GET" });
    if (res?.startups && Array.isArray(res.startups) && res.startups.length > 0) {
      // Map MongoDB _id to id if needed
      const mapped = res.startups.map((item: any) => ({
        ...item,
        id: item.id || item._id || `blr-${Math.random()}`,
      }));
      localStorage.setItem(LOCAL_STORAGE_STARTUPS_KEY, JSON.stringify(mapped));
      return mapped;
    }
  } catch {
    // Silently fallback to local storage
  }
  return getBangaloreStartupsLocal();
};

export const saveBangaloreStartupApi = async (
  startupData: Omit<ActivityStartupItem, "id" | "ratings" | "averageScore" | "totalRatingsCount" | "createdAt">
): Promise<ActivityStartupItem> => {
  const localSaved = saveBangaloreStartupLocal(startupData);
  try {
    const res = await request<{ startup: ActivityStartupItem }>("/activity/startup", {
      method: "POST",
      body: JSON.stringify({ ...startupData, promoCode: "startup20" }),
    });
    if (res?.startup) {
      const serverStartup = {
        ...res.startup,
        id: (res.startup as any)._id || res.startup.id || localSaved.id,
      };
      return serverStartup;
    }
  } catch {
    // Retain local copy if server fails
  }
  return localSaved;
};

export const saveInvestorProfileApi = async (
  investorData: Omit<ActivityInvestorProfile, "id">
): Promise<ActivityInvestorProfile> => {
  const localSaved = saveInvestorProfileLocal(investorData);
  try {
    const res = await request<{ investor: ActivityInvestorProfile }>("/activity/investor", {
      method: "POST",
      body: JSON.stringify({ ...investorData, promoCode: "investor20" }),
    });
    if (res?.investor) {
      const serverInvestor = {
        ...res.investor,
        id: (res.investor as any)._id || res.investor.id || localSaved.id,
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
