import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  createAdminPartnerApi,
  createAdminGalleryApi,
  createAdminBlogApi,
  createAdminEventApi,
  createAdminTestimonialApi,
  deleteAdminPartnerApi,
  deleteAdminGalleryApi,
  deleteAdminBlogApi,
  deleteAdminEventApi,
  deleteAdminTestimonialApi,
  getAdminBlogsApi,
  getAdminEventInterestsApi,
  getAdminEventsApi,
  getAdminGalleryApi,
  getAdminMembersApi,
  createAdminMemberApi,
  deleteAdminMemberApi,
  getAdminNewsletterSubscribersApi,
  getAdminTemplatesApi,
  getAdminJoinRequestsApi,
  updateAdminJoinRequestStatusApi,
  getAdminPartnerInquiriesApi,
  updateAdminPartnerInquiryStatusApi,
  getAdminFundingApplicationsApi,
  getAdminPartnersApi,
  getAdminSiteNoticeApi,
  getAdminPartnerTypesApi,
  getAdminTestimonialsApi,
  updateAdminPartnerApi,
  updateAdminGalleryApi,
  updateAdminBlogApi,
  updateAdminEventApi,
  updateAdminTestimonialApi,
  updateAdminSiteNoticeApi,
  getAdminSliderPromotionsApi,
  createAdminSliderPromotionApi,
  updateAdminSliderPromotionApi,
  deleteAdminSliderPromotionApi,
  type AdminEventInterest,
  type AdminJoinRequest,
  type AdminMember,
  type GalleryImage,
  type DynamicBlogPost,
  type DynamicEvent,
  type FundingApplication,
  type NewsletterAudience,
  type NewsletterSubscriber,
  type EmailTemplate,
  type SliderPromotion,
  createAdminTemplateApi,
  previewAdminTemplateApi,
  createAdminCampaignApi,
  getAdminCampaignsApi,
  getAdminCampaignLogsApi,
  getAdminCampaignApi,
  getCloudinaryUploadSignatureApi,
  type PartnerInquiry,
  type PartnerLogo,
  type SiteNotice,
  type Testimonial,
  type Campaign,
  type RecipientUploadStats,
  getBangaloreStartupsApi,
  getBangaloreInvestorsApi,
  type ActivityStartupItem,
  type ActivityInvestorProfile,
  listAdminInvestorInvitesApi,
  createAdminInvestorInviteApi,
  revokeAdminInvestorInviteApi,
  reactivateAdminInvestorInviteApi,
  deleteAdminInvestorInviteApi,
  type InvestorInvite,
  getAdminInvestorsDirectoryApi,
  type AdminInvestorDetail,
  listAdminsApi,
  createAdminApi,
  updateAdminRoleApi,
  deleteAdminAccountApi,
  type AdminAccountSummary,
  type CreateAdminResponse,
  listAuditLogsApi,
  type AuditLogEntry,
  listAdminChatMessagesApi,
  sendAdminChatMessageApi,
  type AdminChatMessage,
  listChatParticipantsApi,
  type ChatParticipant,
  listTasksApi,
  createTaskApi,
  assignTaskApi,
  updateTaskStatusApi,
  deleteTaskApi,
  type AdminTask,
} from "@/lib/api";
import { getToken, getAccount } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AdminAnalyticsOverview from "@/components/AdminAnalyticsOverview";
import EventMapPreview from "@/components/EventMapPreview";
import {
  BarChart3,
  Calendar,
  FileText,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Mail,
  Send,
  Handshake,
  Mic2,
  Upload,
  Rocket,
  Image,
  Activity,
  Link2,
  Copy,
  Ban,
  RotateCcw,
  Clock3,
  ShieldCheck,
  MessageSquare,
  KeyRound,
} from "lucide-react";

const emptyEventForm = {
  slug: "",
  title: "",
  subtitle: "",
  shortDescription: "",
  bannerImage: "",
  mobileBannerImage: "",
  bannerAlt: "",
  hostName: "",
  hostLogoText: "FC",
  dateLabel: "",
  locationLabel: "",
  mapUrl: "",
  calendarUrl: "",
  registrationUrl: "",
  ticketLabel: "",
  refundPolicy: "",
  about: "",
  expectations: "",
  differentiators: "",
  audience: "",
  tags: "",
  photos: "",
  videos: "",
  faqs: "",
  isPublished: true,
  featuredOnSlider: false,
  sliderOrder: 0,
};

const emptyBlogForm = {
  slug: "",
  title: "",
  excerpt: "",
  author: "",
  date: "",
  readTime: "",
  coverImage: "",
  tags: "",
  sections: "",
  isPublished: true,
};

const emptySiteNoticeForm = {
  title: "Announcement",
  message: "",
  bannerImage: "",
  buttonLabel: "",
  buttonUrl: "",
  isActive: false,
};

const emptyNewsletterForm = {
  subject: "",
  html: "",
};

const emptySliderPromotionForm = {
  title: "",
  description: "",
  imageUrl: "",
  altText: "",
  linkUrl: "",
  buttonLabel: "View More",
  order: 0,
  isActive: true,
  createdBy: "",
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
};

type ImageInputMode = "url" | "upload";

type NewsletterSendSummary = {
  total: number;
  sent: number;
  failed: number;
  failures: Array<{ email: string; message: string }>;
  audience?: NewsletterAudience;
  recipientUpload?: RecipientUploadStats;
};

const emptyPartnerForm = {
  name: "",
  category: "general",
  logoUrl: "",
  websiteUrl: "",
  logoWidth: "auto",
  logoHeight: "auto",
  order: "0",
  isActive: true,
};

const emptyGalleryForm = {
  title: "",
  eventName: "",
  imageUrl: "",
  altText: "",
  caption: "",
  linkUrl: "",
  order: "0",
  isActive: true,
};

const emptyTestimonialForm = {
  name: "",
  role: "",
  initials: "",
  quote: "",
  avatarUrl: "",
  order: "0",
  isActive: true,
};

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const serializeFaqs = (faqs: DynamicEvent["faqs"]) =>
  faqs.map((item) => `${item.question} || ${item.answer}`).join("\n");

const serializeSections = (sections: DynamicBlogPost["sections"]) =>
  sections.map((item) => `${item.heading} || ${item.content}`).join("\n");

const parseFaqs = (value: string) =>
  splitLines(value)
    .map((line) => {
      const [question, answer] = line.split("||").map((item) => item.trim());
      return { question, answer };
    })
    .filter((item) => item.question && item.answer);

const parseSections = (value: string) =>
  splitLines(value)
    .map((line) => {
      const [heading, content] = line.split("||").map((item) => item.trim());
      return { heading, content };
    })
    .filter((item) => item.heading && item.content);

const normalizeEmail = (email: string) => String(email || "").trim().toLowerCase();

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const parseCustomRecipientStats = (value: string) => {
  const parsed = String(value || "")
    .split(/[\n,;\t ]+/)
    .map((item) => normalizeEmail(item))
    .filter(Boolean);

  const unique = new Set<string>();
  let invalid = 0;
  let duplicates = 0;

  for (const email of parsed) {
    if (!EMAIL_REGEX.test(email)) {
      invalid += 1;
      continue;
    }

    if (unique.has(email)) {
      duplicates += 1;
      continue;
    }

    unique.add(email);
  }

  return {
    totalParsed: parsed.length,
    accepted: unique.size,
    invalid,
    duplicates,
  };
};

const AdminDashboard = () => {
  const token = useMemo(() => getToken() || "", []);
  const account = getAccount();
  const [events, setEvents] = useState<DynamicEvent[]>([]);
  const [posts, setPosts] = useState<DynamicBlogPost[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [interests, setInterests] = useState<AdminEventInterest[]>([]);
  const [joinRequests, setJoinRequests] = useState<AdminJoinRequest[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [partners, setPartners] = useState<PartnerLogo[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [partnerInquiries, setPartnerInquiries] = useState<PartnerInquiry[]>([]);
  const [fundingApplications, setFundingApplications] = useState<FundingApplication[]>([]);
  const [partnerTypes, setPartnerTypes] = useState<Array<{ slug: string; name: string }>>([]);
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>("");
  const [activityStartups, setActivityStartups] = useState<ActivityStartupItem[]>([]);
  const [activityInvestors, setActivityInvestors] = useState<ActivityInvestorProfile[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [campaignLogs, setCampaignLogs] = useState<Array<{ to: string; status: string; error?: string; createdAt: string }>>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', html: '' });
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [blogForm, setBlogForm] = useState(emptyBlogForm);
  const [siteNoticeForm, setSiteNoticeForm] = useState(emptySiteNoticeForm);
  const [newsletterForm, setNewsletterForm] = useState(emptyNewsletterForm);
  const [campaignScheduledAt, setCampaignScheduledAt] = useState("");
  const [newsletterAudience, setNewsletterAudience] = useState<NewsletterAudience>("everyone");
  const [customRecipientInput, setCustomRecipientInput] = useState("");
  const [newsletterSending, setNewsletterSending] = useState(false);
  const [newsletterResult, setNewsletterResult] = useState<NewsletterSendSummary | null>(null);
  const [partnerForm, setPartnerForm] = useState(emptyPartnerForm);
  const [galleryForm, setGalleryForm] = useState(emptyGalleryForm);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonialForm);
  const [savingPartner, setSavingPartner] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const [savingTestimonial, setSavingTestimonial] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    role: "user",
  });
  const [savingMember, setSavingMember] = useState(false);
  const [searchMembers, setSearchMembers] = useState("");
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [selectedEventSlug, setSelectedEventSlug] = useState("");
  const [selectedBlogSlug, setSelectedBlogSlug] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [selectedGalleryId, setSelectedGalleryId] = useState("");
  const [selectedTestimonialId, setSelectedTestimonialId] = useState("");
  const [selectedPromotionId, setSelectedPromotionId] = useState("");
  const [promotions, setPromotions] = useState<SliderPromotion[]>([]);
  const [promotionForm, setPromotionForm] = useState(emptySliderPromotionForm);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [uploadingPromotionImage, setUploadingPromotionImage] = useState(false);
  const [promotionImageMode, setPromotionImageMode] = useState<ImageInputMode>("url");
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "events" | "blogs" | "members" | "partners" | "newsletter" | "automation" | "funding" | "promotions" | "activity" | "investor-invites" | "team" | "chat" | "tasks">("dashboard");
  const [investorInvites, setInvestorInvites] = useState<InvestorInvite[]>([]);
  const [investorLeads, setInvestorLeads] = useState<AdminInvestorDetail[]>([]);

  // Team & Access (superadmin)
  const [admins, setAdmins] = useState<AdminAccountSummary[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const emptyNewAdminForm = { fullName: "", email: "", phone: "", city: "", role: "admin" as "admin" | "superadmin" };
  const [newAdminForm, setNewAdminForm] = useState(emptyNewAdminForm);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [justCreatedAdmin, setJustCreatedAdmin] = useState<CreateAdminResponse | null>(null);
  const [updatingAdminId, setUpdatingAdminId] = useState("");

  // Audit log (superadmin)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  // Admin chat
  const [chatMessages, setChatMessages] = useState<AdminChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [chatParticipants, setChatParticipants] = useState<ChatParticipant[]>([]);
  const [mentionedIds, setMentionedIds] = useState<string[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  // Tasks
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const emptyNewTaskForm = { title: "", description: "", priority: "medium" as "low" | "medium" | "high", dueAt: "", assignedTo: "" };
  const [newTaskForm, setNewTaskForm] = useState(emptyNewTaskForm);
  const [creatingTaskItem, setCreatingTaskItem] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [newInviteLabel, setNewInviteLabel] = useState("");
  const [newInviteExpiryDays, setNewInviteExpiryDays] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [uploadingEventBanner, setUploadingEventBanner] = useState(false);
  const [uploadingEventMobileBanner, setUploadingEventMobileBanner] = useState(false);
  const [uploadingBlogCover, setUploadingBlogCover] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [uploadingNoticeBanner, setUploadingNoticeBanner] = useState(false);
  const [uploadingPartnerLogo, setUploadingPartnerLogo] = useState(false);
  const [eventImageMode, setEventImageMode] = useState<ImageInputMode>("url");
  const [eventMobileImageMode, setEventMobileImageMode] = useState<ImageInputMode>("url");
  const [blogImageMode, setBlogImageMode] = useState<ImageInputMode>("url");
  const [noticeImageMode, setNoticeImageMode] = useState<ImageInputMode>("url");
  const [partnerLogoMode, setPartnerLogoMode] = useState<ImageInputMode>("url");

  const exportToCSV = (data: unknown[], filename = "export") => {
    if (!data || !data.length) {
      window.alert("No data to export.");
      return;
    }

    const items = data as Record<string, unknown>[];
    const headers = Array.from(
      new Set(items.flatMap((i) => Object.keys(i || {})))
    );

    const csvRows = [headers.join(",")];

    for (const row of items) {
      const vals = headers.map((h) => {
        const v = row[h];
        if (v === null || v === undefined) return "";
        const s = typeof v === "object" ? JSON.stringify(v) : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      });
      csvRows.push(vals.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredMembers = useMemo(() => {
    const query = searchMembers.toLowerCase().trim();
    if (!query) return members;
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.city.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query)
    );
  }, [members, searchMembers]);

  const newsletterRecipientCounts = useMemo(() => {
    const subscriberEmails = new Set(
      subscribers.filter((subscriber) => subscriber.isActive).map((subscriber) => normalizeEmail(subscriber.email)),
    );
    const memberEmails = new Set(
      members.filter((member) => member.isActive && member.role !== "admin" && member.role !== "superadmin").map((member) => normalizeEmail(member.email)),
    );
    const joinRequestEmails = new Set(joinRequests.map((request) => normalizeEmail(request.email)));

    return {
      subscribers: subscriberEmails.size,
      members: memberEmails.size,
      everyone: new Set<string>([...subscriberEmails, ...memberEmails, ...joinRequestEmails]).size,
    };
  }, [joinRequests, members, subscribers]);

  const customRecipientStats = useMemo(() => parseCustomRecipientStats(customRecipientInput), [customRecipientInput]);

  const recipientCountForAudience =
    newsletterAudience === "subscribers"
      ? newsletterRecipientCounts.subscribers
      : newsletterAudience === "members"
        ? newsletterRecipientCounts.members
        : newsletterAudience === "custom"
          ? customRecipientStats.accepted
          : newsletterRecipientCounts.everyone;

  const loadAdminData = () => {
    Promise.all([
      getAdminEventsApi(token),
      getAdminBlogsApi(token),
      getAdminMembersApi(token),
      getAdminEventInterestsApi(token),
      getAdminJoinRequestsApi(token),
      getAdminNewsletterSubscribersApi(token),
      getAdminTemplatesApi(token),
      getAdminCampaignsApi(token),
      getAdminPartnersApi(token),
      getAdminGalleryApi(token),
      getAdminTestimonialsApi(token),
      getAdminPartnerInquiriesApi(token),
      getAdminFundingApplicationsApi(token),
      getAdminPartnerTypesApi(token),
      getAdminSiteNoticeApi(token),
      getAdminSliderPromotionsApi(token),
      getBangaloreStartupsApi(),
      getBangaloreInvestorsApi(),
      listAdminInvestorInvitesApi(token),
      getAdminInvestorsDirectoryApi(token),
    ])
      .then(([
        eventsResponse,
        blogsResponse,
        membersResponse,
        interestsResponse,
        joinRequestsResponse,
        subscribersResponse,
        templatesResponse,
        campaignsResponse,
        partnersResponse,
        galleryResponse,
        testimonialsResponse,
        partnerInquiriesResponse,
        fundingResponse,
        partnerTypesResponse,
        noticeResponse,
        promotionsResponse,
        startupsResponse,
        investorsResponse,
        investorInvitesResponse,
        investorLeadsResponse,
      ]) => {
        setEvents(eventsResponse.events);
        setPosts(blogsResponse.posts);
        setMembers(membersResponse.members);
        setInterests(interestsResponse.interests);
        setJoinRequests(joinRequestsResponse.requests);
        setSubscribers(subscribersResponse.subscribers);
        setPartners(partnersResponse.partners);
        setPartnerInquiries(partnerInquiriesResponse.inquiries);
        setFundingApplications(fundingResponse.applications);
        setPartnerTypes(partnerTypesResponse.types || []);
        setTemplates(templatesResponse.templates || []);
        setCampaigns(campaignsResponse.campaigns || []);
        setPromotions(promotionsResponse.promotions || []);
        setActivityStartups(startupsResponse || []);
        setActivityInvestors(investorsResponse || []);
        setSiteNoticeForm(
          noticeResponse.notice
            ? {
                title: noticeResponse.notice.title || "Announcement",
                message: noticeResponse.notice.message || "",
                bannerImage: noticeResponse.notice.bannerImage || "",
                buttonLabel: noticeResponse.notice.buttonLabel || "",
                buttonUrl: noticeResponse.notice.buttonUrl || "",
                isActive: Boolean(noticeResponse.notice.isActive),
              }
            : emptySiteNoticeForm,
        );
        setGalleryImages(galleryResponse.images || []);
        setTestimonials(testimonialsResponse.testimonials || []);
        setInvestorInvites(investorInvitesResponse.invites || []);
        setInvestorLeads(investorLeadsResponse.investors || []);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load admin data.");
      });
  };

  const getInvestorInviteLink = (inviteToken: string) =>
    `${window.location.origin}/register/investor?token=${inviteToken}`;

  const handleCreateInvestorInvite = () => {
    setCreatingInvite(true);
    const expiresInDays = newInviteExpiryDays.trim() ? Number(newInviteExpiryDays.trim()) : undefined;

    createAdminInvestorInviteApi(token, { label: newInviteLabel.trim(), expiresInDays })
      .then((response) => {
        setInvestorInvites((prev) => [response.invite, ...prev]);
        setNewInviteLabel("");
        setNewInviteExpiryDays("");
        navigator.clipboard?.writeText(getInvestorInviteLink(response.invite.token)).catch(() => {});
        window.alert("Invite link created and copied to clipboard.");
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to create invite link.");
      })
      .finally(() => setCreatingInvite(false));
  };

  const handleCopyInviteLink = (inviteToken: string) => {
    navigator.clipboard?.writeText(getInvestorInviteLink(inviteToken)).catch(() => {});
    window.alert("Invite link copied to clipboard.");
  };

  const handleRevokeInvestorInvite = (id: string) => {
    if (!window.confirm("Revoke this invite link? It will stop working immediately.")) return;

    revokeAdminInvestorInviteApi(token, id)
      .then((response) => {
        setInvestorInvites((prev) => prev.map((invite) => (invite._id === id ? response.invite : invite)));
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to revoke invite link.");
      });
  };

  const handleReactivateInvestorInvite = (id: string) => {
    reactivateAdminInvestorInviteApi(token, id)
      .then((response) => {
        setInvestorInvites((prev) => prev.map((invite) => (invite._id === id ? response.invite : invite)));
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to reactivate invite link.");
      });
  };

  const handleDeleteInvestorInvite = (id: string) => {
    if (!window.confirm("Permanently delete this invite link?")) return;

    deleteAdminInvestorInviteApi(token, id)
      .then(() => {
        setInvestorInvites((prev) => prev.filter((invite) => invite._id !== id));
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to delete invite link.");
      });
  };

  const loadAdmins = () => {
    setLoadingAdmins(true);
    listAdminsApi(token)
      .then((response) => setAdmins(response.admins || []))
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load admins.");
      })
      .finally(() => setLoadingAdmins(false));
  };

  const loadAuditLogs = () => {
    setLoadingAuditLogs(true);
    listAuditLogsApi(token)
      .then((response) => setAuditLogs(response.logs || []))
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load activity history.");
      })
      .finally(() => setLoadingAuditLogs(false));
  };

  useEffect(() => {
    if (activeTab === "team" && account?.role === "superadmin") {
      loadAdmins();
      loadAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm.fullName.trim() || !newAdminForm.email.trim() || !newAdminForm.phone.trim() || !newAdminForm.city.trim()) {
      window.alert("Please fill in all fields.");
      return;
    }

    setCreatingAdmin(true);
    createAdminApi(token, {
      fullName: newAdminForm.fullName.trim(),
      email: newAdminForm.email.trim().toLowerCase(),
      phone: newAdminForm.phone.trim(),
      city: newAdminForm.city.trim(),
      role: newAdminForm.role,
    })
      .then((response) => {
        setJustCreatedAdmin(response);
        setNewAdminForm(emptyNewAdminForm);
        loadAdmins();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to create admin account.");
      })
      .finally(() => setCreatingAdmin(false));
  };

  const handleUpdateAdminRole = (id: string, role: "admin" | "superadmin") => {
    setUpdatingAdminId(id);
    updateAdminRoleApi(token, id, role)
      .then(() => loadAdmins())
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to update role.");
      })
      .finally(() => setUpdatingAdminId(""));
  };

  const handleDeleteAdmin = (id: string, fullName: string) => {
    if (!window.confirm(`Permanently delete ${fullName}'s admin account? This cannot be undone, and their email will be free to use again.`)) return;

    setUpdatingAdminId(id);
    deleteAdminAccountApi(token, id, true)
      .then(() => loadAdmins())
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to delete admin.");
      })
      .finally(() => setUpdatingAdminId(""));
  };

  // Admin chat: poll for new messages while the chat tab is open
  const lastChatMessageTimeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (activeTab !== "chat") return;

    let cancelled = false;

    listChatParticipantsApi(token)
      .then((response) => {
        if (!cancelled) setChatParticipants(response.participants || []);
      })
      .catch(() => {});

    listAdminChatMessagesApi(token)
      .then((response) => {
        if (cancelled) return;
        const messages = response.messages || [];
        setChatMessages(messages);
        lastChatMessageTimeRef.current = messages[messages.length - 1]?.createdAt;
      })
      .catch(() => {});

    const interval = setInterval(() => {
      listAdminChatMessagesApi(token, lastChatMessageTimeRef.current)
        .then((response) => {
          if (cancelled || !response.messages?.length) return;
          lastChatMessageTimeRef.current = response.messages[response.messages.length - 1].createdAt;
          setChatMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id));
            const fresh = response.messages.filter((m) => !existingIds.has(m._id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        })
        .catch(() => {});
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const mentionMatches = mentionQuery !== null
    ? chatParticipants.filter(
        (p) => p._id !== account?.id && p.fullName.toLowerCase().includes(mentionQuery.toLowerCase()),
      )
    : [];

  const handleChatInputChange = (value: string) => {
    setChatInput(value);
    const trailingMention = value.match(/(?:^|\s)@([a-zA-Z]*)$/);
    setMentionQuery(trailingMention ? trailingMention[1] : null);
  };

  const handlePickMention = (participant: ChatParticipant) => {
    const newValue = chatInput.replace(/(?:^|\s)@([a-zA-Z]*)$/, (match) => {
      const prefix = match.startsWith(" ") ? " " : "";
      return `${prefix}@${participant.fullName} `;
    });
    setChatInput(newValue);
    setMentionedIds((prev) => (prev.includes(participant._id) ? prev : [...prev, participant._id]));
    setMentionQuery(null);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setSendingChat(true);
    sendAdminChatMessageApi(token, text, account?.fullName, mentionedIds)
      .then((response) => {
        setChatMessages((prev) => [...prev, response.chatMessage]);
        lastChatMessageTimeRef.current = response.chatMessage.createdAt;
        setChatInput("");
        setMentionedIds([]);
        setMentionQuery(null);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to send message.");
      })
      .finally(() => setSendingChat(false));
  };

  const loadTasks = () => {
    setLoadingTasks(true);
    listTasksApi(token, taskStatusFilter ? { status: taskStatusFilter } : undefined)
      .then((response) => setTasks(response.tasks || []))
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load tasks.");
      })
      .finally(() => setLoadingTasks(false));
  };

  useEffect(() => {
    if (activeTab === "tasks") {
      loadTasks();
      if (account?.role === "superadmin" && admins.length === 0) {
        loadAdmins();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, taskStatusFilter]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) {
      window.alert("Please enter a task title.");
      return;
    }

    setCreatingTaskItem(true);
    createTaskApi(token, {
      title: newTaskForm.title.trim(),
      description: newTaskForm.description.trim(),
      priority: newTaskForm.priority,
      dueAt: newTaskForm.dueAt || undefined,
    })
      .then((response) => {
        if (newTaskForm.assignedTo) {
          return assignTaskApi(token, response.task._id, newTaskForm.assignedTo);
        }
        return response;
      })
      .then(() => {
        setNewTaskForm(emptyNewTaskForm);
        loadTasks();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to create task.");
      })
      .finally(() => setCreatingTaskItem(false));
  };

  const handleAssignTask = (id: string, assignedTo: string) => {
    setUpdatingTaskId(id);
    assignTaskApi(token, id, assignedTo || null)
      .then((response) => {
        setTasks((prev) => prev.map((t) => (t._id === id ? response.task : t)));
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to assign task.");
      })
      .finally(() => setUpdatingTaskId(""));
  };

  const handleUpdateTaskStatus = (id: string, status: "open" | "in_progress" | "done") => {
    setUpdatingTaskId(id);
    updateTaskStatusApi(token, id, status)
      .then((response) => {
        setTasks((prev) => prev.map((t) => (t._id === id ? response.task : t)));
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to update task.");
      })
      .finally(() => setUpdatingTaskId(""));
  };

  const handleDeleteTask = (id: string) => {
    if (!window.confirm("Delete this task?")) return;

    setUpdatingTaskId(id);
    deleteTaskApi(token, id)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t._id !== id));
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to delete task.");
      })
      .finally(() => setUpdatingTaskId(""));
  };

  const [updatingJoinRequestId, setUpdatingJoinRequestId] = useState("");

  const handleJoinRequestStatus = (id: string, status: "pending" | "approved" | "denied") => {
    if (status === "approved" && !window.confirm("Approve this request? An email will be sent to notify them.")) return;
    if (status === "denied" && !window.confirm("Deny this request?")) return;

    setUpdatingJoinRequestId(id);
    updateAdminJoinRequestStatusApi(token, id, status)
      .then((response) => {
        setJoinRequests((prev) => prev.map((request) => (request._id === id ? response.request : request)));
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to update join request.");
      })
      .finally(() => setUpdatingJoinRequestId(""));
  };

  const [updatingPartnerInquiryId, setUpdatingPartnerInquiryId] = useState("");

  const handlePartnerInquiryStatus = (id: string, status: "pending" | "approved" | "rejected") => {
    if (status === "approved" && !window.confirm("Approve this partnership inquiry? An email will be sent to notify them.")) return;
    if (status === "rejected" && !window.confirm("Reject this partnership inquiry?")) return;

    setUpdatingPartnerInquiryId(id);
    updateAdminPartnerInquiryStatusApi(token, id, status)
      .then((response) => {
        setPartnerInquiries((prev) => prev.map((inquiry) => (inquiry._id === id ? response.inquiry : inquiry)));
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to update partner inquiry.");
      })
      .finally(() => setUpdatingPartnerInquiryId(""));
  };

  const filteredPartnerInquiries = useMemo(() => {
    if (!partnerTypeFilter) return partnerInquiries;
    return partnerInquiries.filter((p) => p.partnershipType === partnerTypeFilter);
  }, [partnerInquiries, partnerTypeFilter]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSaveEvent = () => {
    const missing = [];
    if (!eventForm.title.trim()) missing.push("Title");
    if (!eventForm.bannerImage.trim()) missing.push("Banner Image");

    if (missing.length > 0) {
      window.alert(`Please provide ${missing.join(" and ")} before saving.`);
      return;
    }

    const payload = {
      ...eventForm,
      about: splitLines(eventForm.about),
      expectations: splitLines(eventForm.expectations),
      differentiators: splitLines(eventForm.differentiators),
      audience: splitLines(eventForm.audience),
      tags: splitLines(eventForm.tags),
      photos: splitLines(eventForm.photos),
      videos: splitLines(eventForm.videos),
      faqs: parseFaqs(eventForm.faqs),
    };

    const request = selectedEventSlug
      ? updateAdminEventApi(token, selectedEventSlug, payload)
      : createAdminEventApi(token, payload);

    request
      .then((response) => {
        window.alert(response.message);
        setEventForm(emptyEventForm);
        setSelectedEventSlug("");
        setShowEventForm(false);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save event.");
      });
  };

  const handleSaveBlog = () => {
    const missing = [];
    if (!blogForm.title.trim()) missing.push("Title");
    if (!blogForm.coverImage.trim()) missing.push("Cover Image");

    if (missing.length > 0) {
      window.alert(`Please provide ${missing.join(" and ")} before saving.`);
      return;
    }

    const payload = {
      ...blogForm,
      tags: splitLines(blogForm.tags),
      sections: parseSections(blogForm.sections),
    };

    const request = selectedBlogSlug
      ? updateAdminBlogApi(token, selectedBlogSlug, payload)
      : createAdminBlogApi(token, payload);

    request
      .then((response) => {
        window.alert(response.message);
        setBlogForm(emptyBlogForm);
        setSelectedBlogSlug("");
        setShowBlogForm(false);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save blog post.");
      });
  };

  const handleSaveSiteNotice = () => {
    if (siteNoticeForm.isActive && !siteNoticeForm.message.trim()) {
      window.alert("Please add a popup message before activating it.");
      return;
    }

    updateAdminSiteNoticeApi(token, siteNoticeForm)
      .then((response) => {
        window.alert(response.message);
        setSiteNoticeForm({
          title: response.notice.title || "Announcement",
          message: response.notice.message || "",
          bannerImage: response.notice.bannerImage || "",
          buttonLabel: response.notice.buttonLabel || "",
          buttonUrl: response.notice.buttonUrl || "",
          isActive: Boolean(response.notice.isActive),
        });
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save site notice.");
      });
  };

  const handleSaveMember = () => {
    const { fullName, email, password, phone, city, role } = memberForm;
    if (!fullName.trim() || !email.trim() || !password.trim() || !phone.trim() || !city.trim()) {
      window.alert("Please fill all required fields to add a member.");
      return;
    }

    setSavingMember(true);
    createAdminMemberApi(token, {
      fullName,
      email,
      password,
      phone,
      city,
      role,
    })
      .then((response) => {
        window.alert(response.message);
        setMemberForm({
          fullName: "",
          email: "",
          password: "",
          phone: "",
          city: "",
          role: "user",
        });
        setShowMemberForm(false);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save member.");
      })
      .finally(() => {
        setSavingMember(false);
      });
  };

  const handleDeleteMember = (id: string, name: string) => {
    const confirmed = window.confirm(`Are you absolutely sure you want to delete member "${name}"? This action is permanent and will delete their dashboard as well.`);
    if (!confirmed) return;

    deleteAdminMemberApi(token, id)
      .then((response) => {
        window.alert(response.message);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to delete member.");
      });
  };

  const handlePromoteMemberToAdmin = (id: string, name: string) => {
    if (!window.confirm(`Make ${name} an admin? They'll keep their existing login/email but gain admin dashboard access.`)) return;

    updateAdminRoleApi(token, id, "admin")
      .then(() => {
        window.alert(`${name} is now an admin.`);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to promote member.");
      });
  };

  const handleSendAutomation = () => {
    if (!newsletterForm.subject.trim() || !newsletterForm.html.trim()) {
      window.alert("Please add a subject and HTML content before sending.");
      return;
    }

    if (newsletterAudience === "custom" && customRecipientStats.totalParsed === 0) {
      window.alert("Paste at least one email address for custom audience.");
      return;
    }

    if (recipientCountForAudience === 0) {
      window.alert("There are no recipients for the selected audience.");
      return;
    }

    const invalidHint =
      newsletterAudience === "custom" && (customRecipientStats.invalid > 0 || customRecipientStats.duplicates > 0)
        ? `\nInvalid ignored: ${customRecipientStats.invalid}, duplicates ignored: ${customRecipientStats.duplicates}`
        : "";

    const confirmed = window.confirm(
      `Send this email to ${recipientCountForAudience} recipient${recipientCountForAudience === 1 ? "" : "s"}?${invalidHint}`,
    );

    if (!confirmed) {
      return;
    }

    setNewsletterSending(true);
    setNewsletterResult(null);

    // create campaign via API (uses templates if selected)
    createAdminCampaignApi(token, {
      name: newsletterForm.subject,
      subject: newsletterForm.subject,
      html: selectedTemplateId ? undefined : newsletterForm.html,
      templateId: selectedTemplateId || undefined,
      audience: newsletterAudience,
      scheduledAt: campaignScheduledAt || undefined,
      recipientsText: newsletterAudience === "custom" ? customRecipientInput : undefined,
    })
      .then((response) => {
        window.alert(response.message);
        setNewsletterResult({
          total: response.total,
          sent: 0,
          failed: 0,
          failures: [],
          audience: newsletterAudience,
          recipientUpload: response.recipientUpload,
        });
        setNewsletterForm(emptyNewsletterForm);
        setNewsletterAudience("everyone");
        setCustomRecipientInput("");
        setCampaignScheduledAt("");
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to schedule campaign.");
      })
      .finally(() => setNewsletterSending(false));
  };

  const loadCampaignDetails = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    Promise.all([getAdminCampaignApi(token, campaignId), getAdminCampaignLogsApi(token, campaignId)])
      .then(([campaignResponse, logsResponse]) => {
        setCampaignLogs(logsResponse.logs || []);
        const current = campaignResponse.campaign;
        setNewsletterForm({
          subject: current.subject || "",
          html: (current as { html?: string }).html || "",
        });
        setNewsletterAudience((current.audience as NewsletterAudience) || "everyone");
        setCustomRecipientInput("");
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load campaign details.");
      });
  };

  const handleEventBannerUpload = async (file?: File | null) => {
    if (!file) return;
    if (!token) {
      window.alert("Please log in again before uploading images.");
      return;
    }

    setUploadingEventBanner(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/events",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("folder", signaturePayload.folder);

      if (signaturePayload.publicId) {
        formData.append("public_id", signaturePayload.publicId);
      }

      const uploadResponse = await fetch(signaturePayload.uploadUrl, {
        method: "POST",
        body: formData,
      });

      const uploadData = (await uploadResponse.json().catch(() => ({}))) as CloudinaryUploadResponse & {
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed.");
      }

      setEventForm((current) => ({
        ...current,
        bannerImage: uploadData.secure_url || "",
        bannerAlt: current.bannerAlt || current.title || file.name.replace(/\.[^.]+$/, ""),
      }));

      window.alert("Image uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image.";
      window.alert(message);
    } finally {
      setUploadingEventBanner(false);
    }
  };

  const handlePartnerLogoUpload = async (file?: File | null) => {
    if (!file) return;
    if (!token) {
      window.alert("Please log in again before uploading images.");
      return;
    }

    setUploadingPartnerLogo(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/partners",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("folder", signaturePayload.folder);

      if (signaturePayload.publicId) {
        formData.append("public_id", signaturePayload.publicId);
      }

      const uploadResponse = await fetch(signaturePayload.uploadUrl, {
        method: "POST",
        body: formData,
      });

      const uploadData = (await uploadResponse.json().catch(() => ({}))) as CloudinaryUploadResponse & {
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed.");
      }

      setPartnerForm((current) => ({
        ...current,
        logoUrl: uploadData.secure_url || "",
      }));

      window.alert("Logo uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload logo.";
      window.alert(message);
    } finally {
      setUploadingPartnerLogo(false);
    }
  };

  const handleEventMobileBannerUpload = async (file?: File | null) => {
    if (!file) return;
    if (!token) {
      window.alert("Please log in again before uploading images.");
      return;
    }
    setUploadingEventMobileBanner(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/events/mobile",
      });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("folder", signaturePayload.folder);
      if (signaturePayload.publicId) {
        formData.append("public_id", signaturePayload.publicId);
      }
      const uploadResponse = await fetch(signaturePayload.uploadUrl, {
        method: "POST",
        body: formData,
      });
      const uploadData = (await uploadResponse.json().catch(() => ({}))) as CloudinaryUploadResponse & {
        error?: { message?: string };
      };
      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed.");
      }
      setEventForm((current) => ({
        ...current,
        mobileBannerImage: uploadData.secure_url || "",
      }));
      window.alert("Mobile image uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image.";
      window.alert(message);
    } finally {
      setUploadingEventMobileBanner(false);
    }
  };

  const handleBlogCoverUpload = async (file?: File | null) => {
    if (!file) return;
    if (!token) {
      window.alert("Please log in again before uploading images.");
      return;
    }

    setUploadingBlogCover(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/blogs",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("folder", signaturePayload.folder);

      if (signaturePayload.publicId) {
        formData.append("public_id", signaturePayload.publicId);
      }

      const uploadResponse = await fetch(signaturePayload.uploadUrl, {
        method: "POST",
        body: formData,
      });

      const uploadData = (await uploadResponse.json().catch(() => ({}))) as CloudinaryUploadResponse & {
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed.");
      }

      setBlogForm((current) => ({
        ...current,
        coverImage: uploadData.secure_url || "",
      }));

      window.alert("Image uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image.";
      window.alert(message);
    } finally {
      setUploadingBlogCover(false);
    }
  };

  const handleSiteNoticeBannerUpload = async (file?: File | null) => {
    if (!file) return;
    if (!token) {
      window.alert("Please log in again before uploading images.");
      return;
    }

    setUploadingNoticeBanner(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/notices",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("folder", signaturePayload.folder);

      if (signaturePayload.publicId) {
        formData.append("public_id", signaturePayload.publicId);
      }

      const uploadResponse = await fetch(signaturePayload.uploadUrl, {
        method: "POST",
        body: formData,
      });

      const uploadData = (await uploadResponse.json().catch(() => ({}))) as CloudinaryUploadResponse & {
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed.");
      }

      setSiteNoticeForm((current) => ({
        ...current,
        bannerImage: uploadData.secure_url || "",
      }));

      window.alert("Image uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image.";
      window.alert(message);
    } finally {
      setUploadingNoticeBanner(false);
    }
  };

  const handleGalleryImageUpload = async (file?: File | null) => {
    if (!file) return;
    if (!token) {
      window.alert("Please log in again before uploading images.");
      return;
    }

    setUploadingGalleryImage(true);
    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: "founders-connect/gallery",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("folder", signaturePayload.folder);

      if (signaturePayload.publicId) {
        formData.append("public_id", signaturePayload.publicId);
      }

      const uploadResponse = await fetch(signaturePayload.uploadUrl, {
        method: "POST",
        body: formData,
      });

      const uploadData = (await uploadResponse.json().catch(() => ({}))) as CloudinaryUploadResponse & {
        error?: { message?: string };
      };

      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed.");
      }

      setGalleryForm((current) => ({
        ...current,
        imageUrl: uploadData.secure_url || "",
        altText: current.altText || file.name.replace(/\.[^.]+$/, ""),
      }));

      window.alert("Image uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image.";
      window.alert(message);
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  const handleSavePartner = () => {
    const missing = [];
    if (!partnerForm.name.trim()) missing.push("Name");
    if (!partnerForm.logoUrl.trim()) missing.push("Logo");

    if (missing.length > 0) {
      window.alert(`Please provide ${missing.join(" and ")} before saving.`);
      return;
    }

    const payload: Pick<PartnerLogo, "name" | "category" | "logoUrl" | "websiteUrl" | "logoWidth" | "logoHeight" | "order" | "isActive"> = {
      name: partnerForm.name.trim(),
      category: (partnerForm.category.trim().toLowerCase() as "general" | "college" | "ecell" | "sponsor"),
      logoUrl: partnerForm.logoUrl.trim(),
      websiteUrl: partnerForm.websiteUrl.trim(),
      logoWidth: partnerForm.logoWidth.trim() || "auto",
      logoHeight: partnerForm.logoHeight.trim() || "auto",
      order: Number(partnerForm.order || 0),
      isActive: Boolean(partnerForm.isActive),
    };

    setSavingPartner(true);
    const request = selectedPartnerId
      ? updateAdminPartnerApi(token, selectedPartnerId, payload)
      : createAdminPartnerApi(token, payload);

    request
      .then((response) => {
        window.alert(response.message);
        setPartnerForm(emptyPartnerForm);
        setSelectedPartnerId("");
        setShowPartnerForm(false);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save partner.");
      })
      .finally(() => setSavingPartner(false));
  };

  const handleSaveGalleryImage = () => {
    const missing = [];
    if (!galleryForm.title.trim()) missing.push("Title");
    if (!galleryForm.imageUrl.trim()) missing.push("Image");

    if (missing.length > 0) {
      window.alert(`Please provide ${missing.join(" and ")} before saving.`);
      return;
    }

    const payload = {
      title: galleryForm.title.trim(),
      imageUrl: galleryForm.imageUrl.trim(),
      altText: galleryForm.altText.trim(),
      caption: galleryForm.caption.trim(),
      linkUrl: galleryForm.linkUrl.trim(),
      order: Number(galleryForm.order || 0),
      isActive: Boolean(galleryForm.isActive),
    };

    setSavingGallery(true);
    const request = selectedGalleryId
      ? updateAdminGalleryApi(token, selectedGalleryId, payload)
      : createAdminGalleryApi(token, payload);

    request
      .then((response) => {
        window.alert(response.message);
        setGalleryForm(emptyGalleryForm);
        setSelectedGalleryId("");
        setShowGalleryForm(false);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save gallery image.");
      })
      .finally(() => setSavingGallery(false));
  };

  const handleSaveTestimonial = () => {
    const missing = [];
    if (!testimonialForm.name.trim()) missing.push("Name");
    if (!testimonialForm.role.trim()) missing.push("Role");
    if (!testimonialForm.quote.trim()) missing.push("Quote");

    if (missing.length > 0) {
      window.alert(`Please provide ${missing.join(" and ")} before saving.`);
      return;
    }

    const payload = {
      name: testimonialForm.name.trim(),
      role: testimonialForm.role.trim(),
      initials: testimonialForm.initials.trim(),
      quote: testimonialForm.quote.trim(),
      avatarUrl: testimonialForm.avatarUrl.trim(),
      order: Number(testimonialForm.order || 0),
      isActive: Boolean(testimonialForm.isActive),
    };

    setSavingTestimonial(true);
    const request = selectedTestimonialId
      ? updateAdminTestimonialApi(token, selectedTestimonialId, payload)
      : createAdminTestimonialApi(token, payload);

    request
      .then((response) => {
        window.alert(response.message);
        setTestimonialForm(emptyTestimonialForm);
        setSelectedTestimonialId("");
        setShowTestimonialForm(false);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save testimonial.");
      })
      .finally(() => setSavingTestimonial(false));
  };

  const handleSavePromotion = () => {
    const missing = [];
    if (!promotionForm.title.trim()) missing.push("Title");
    if (!promotionForm.imageUrl.trim()) missing.push("Image URL");

    if (missing.length > 0) {
      window.alert(`Please provide ${missing.join(" and ")} before saving.`);
      return;
    }

    const payload = {
      title: promotionForm.title.trim(),
      description: promotionForm.description.trim(),
      imageUrl: promotionForm.imageUrl.trim(),
      altText: promotionForm.altText.trim(),
      linkUrl: promotionForm.linkUrl.trim(),
      buttonLabel: promotionForm.buttonLabel.trim() || "View More",
      order: Number(promotionForm.order || 0),
      isActive: Boolean(promotionForm.isActive),
      createdBy: account?.id || "",
    };

    const request = selectedPromotionId
      ? updateAdminSliderPromotionApi(token, selectedPromotionId, payload)
      : createAdminSliderPromotionApi(token, payload);

    request
      .then((response) => {
        window.alert(response.message);
        setPromotionForm(emptySliderPromotionForm);
        setSelectedPromotionId("");
        setShowPromotionForm(false);
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save promotion.");
      });
  };

  const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <Card className="border-slate-200">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className="rounded-lg bg-violet-50 p-2.5">
            <Icon className="h-5 w-5 text-violet-600" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3.5 w-3.5" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const adminMenuItems = [
    { label: "Dashboard", id: "dashboard", icon: BarChart3 },
    { label: "Analytics", id: "analytics", icon: TrendingUp },
    { label: "Bangalore Event", id: "activity", icon: Activity },
    { label: "Events", id: "events", icon: Calendar },
    { label: "Promotions", id: "promotions", icon: Image },
    { label: "Blogs", id: "blogs", icon: FileText },
    { label: "Members", id: "members", icon: Users },
    { label: "Partners", id: "partners", icon: Handshake },
    { label: "Newsletter", id: "newsletter", icon: Mail },
    { label: "Email Automation", id: "automation", icon: Send },
    { label: "Funding", id: "funding", icon: Rocket },
    { label: "Investor Invites", id: "investor-invites", icon: Link2 },
    { label: "Admin Chat", id: "chat", icon: MessageSquare },
    { label: "Tasks", id: "tasks", icon: CheckCircle2 },
    ...(account?.role === "superadmin" ? [{ label: "Team & Access", id: "team", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-white fixed h-screen flex flex-col overflow-y-auto">
        <div className="border-b border-slate-800 p-5">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 font-bold text-white">
              FC
            </div>
            <div>
              <p className="font-semibold text-sm">Founders Connect</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        <div className="border-b border-slate-800 px-5 py-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Admin Info</p>
          <p className="mt-2 text-sm font-semibold">{account?.fullName || "Admin"}</p>
          <p className="text-xs text-slate-400">{account?.email}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-violet-300">
            <BarChart3 size={12} />
            Administrator
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminMenuItems.map(({ label, id, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  active
                    ? "bg-violet-500/15 text-violet-200"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-900 hover:text-white transition-colors w-full"
          >
            <Eye size={18} />
            View Site
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {showMobileNav && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileNav(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-950 text-white p-4 overflow-y-auto">
            <div className="border-b border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 font-bold text-white">FC</div>
                <div>
                  <p className="font-semibold text-sm">Founders Connect</p>
                  <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
              </div>
            </div>
            <div className="border-b border-slate-800 px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Admin Info</p>
              <p className="mt-2 text-sm font-semibold">{account?.fullName || "Admin"}</p>
              <p className="text-xs text-slate-400">{account?.email}</p>
            </div>
            <nav className="mt-4 space-y-1">
              {adminMenuItems.map(({ label, id, icon: Icon }) => (
                <button
                  key={`mobile-${id}`}
                  onClick={() => { setActiveTab(id as typeof activeTab); setShowMobileNav(false); }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between md:hidden mb-3">
              <Button variant="ghost" size="sm" onClick={() => setShowMobileNav(true)} className="gap-2">
                Menu
              </Button>
              <div className="text-sm text-slate-700">Admin</div>
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-700">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              {activeTab === "dashboard" && "Control Center"}
              {activeTab === "analytics" && "Analytics"}
              {activeTab === "events" && "Events Management"}
              {activeTab === "promotions" && "Slider Promotions Management"}
              {activeTab === "blogs" && "Blog Management"}
              {activeTab === "members" && "Members & Requests"}
              {activeTab === "partners" && "Partners Management"}
              {activeTab === "newsletter" && "Newsletter Management"}
              {activeTab === "automation" && "Email Automation"}
              {activeTab === "funding" && "Funding Applications"}
              {activeTab === "activity" && "Bangalore Event Activity"}
              {activeTab === "investor-invites" && "Investor Invite Links"}
              {activeTab === "team" && "Team & Access"}
              {activeTab === "chat" && "Admin Chat"}
              {activeTab === "tasks" && "Tasks"}
            </h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              {activeTab === "dashboard" && "Welcome back! Here's your admin overview."}
              {activeTab === "analytics" && "Community breakdown and event registration counts."}
              {activeTab === "events" && "Create, edit, or manage event content"}
              {activeTab === "promotions" && "Add and manage promotional banners for the hero slider (second feature)"}
              {activeTab === "blogs" && "Create, edit, or manage blog posts"}
              {activeTab === "members" && "Manage members and guest event requests"}
              {activeTab === "partners" && "Add and manage partner logos shown on the landing page."}
              {activeTab === "newsletter" && "View subscribers and manage newsletter signups."}
              {activeTab === "automation" && "Send bulk campaigns to subscribers, members, or everyone."}
              {activeTab === "funding" && "Review and manage startup funding applications."}
              {activeTab === "activity" && "View live registrations for startups and investors from the Bangalore Event."}
              {activeTab === "investor-invites" && "Generate invite-only links for investor registration and manage who they've been shared with."}
              {activeTab === "team" && "Create admin accounts, manage access, and review admin activity history."}
              {activeTab === "chat" && "Message other admins in real time."}
              {activeTab === "tasks" && "Create, assign, and track tasks across the admin team."}
            </p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Calendar} label="Active Events" value={events.length} trend={`${events.filter(e => e.isPublished).length} published`} />
                <StatCard icon={FileText} label="Blog Posts" value={posts.length} trend={`${posts.filter(p => p.isPublished).length} published`} />
                <StatCard icon={Users} label="Total Members" value={members.length} trend={`${members.filter(m => m.role === "admin" || m.role === "superadmin").length} admins`} />
                <StatCard icon={AlertCircle} label="Guest Requests" value={interests.length} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => { setShowEventForm(true); setSelectedEventSlug(""); setEventForm(emptyEventForm); }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                  <Button
                    onClick={() => { setShowBlogForm(true); setSelectedBlogSlug(""); setBlogForm(emptyBlogForm); }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Blog Post
                  </Button>
                  <Link to="/events" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
                    <Eye className="h-4 w-4" />
                    View Events
                  </Link>
                  <Link to="/blog" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
                    <Eye className="h-4 w-4" />
                    View Blog
                  </Link>
                  <Button variant="outline" onClick={() => setActiveTab("newsletter")} className="gap-2">
                    <Mail className="h-4 w-4" />
                    Newsletter
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("analytics")} className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Analytics
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("partners")} className="gap-2">
                    <Handshake className="h-4 w-4" />
                    Partners
                  </Button>
                  <Link to="/admin/speaker-investors" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
                    <Upload className="h-4 w-4" />
                    Speakers & Investors
                  </Link>
                  <Link to="/admin/investors" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
                    <TrendingUp className="h-4 w-4" />
                    Investors Directory
                  </Link>
                  <Link to="/admin/members" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
                    <Users className="h-4 w-4" />
                    Members Directory
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-violet-200 bg-violet-50/70">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">Landing Page Popup</CardTitle>
                      <CardDescription>Shown to every visitor when they open the landing page.</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant={siteNoticeForm.isActive ? "default" : "outline"}
                      onClick={() => setSiteNoticeForm((current) => ({ ...current, isActive: !current.isActive }))}
                    >
                      {siteNoticeForm.isActive ? "Active" : "Inactive"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 bg-white/80">
                  <Input
                    placeholder="Popup title"
                    value={siteNoticeForm.title}
                    onChange={(e) => setSiteNoticeForm((current) => ({ ...current, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Popup message"
                    value={siteNoticeForm.message}
                    onChange={(e) => setSiteNoticeForm((current) => ({ ...current, message: e.target.value }))}
                    className="min-h-28"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700">Banner Image (optional)</label>
                      <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setNoticeImageMode("url")}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            noticeImageMode === "url"
                              ? "bg-violet-500 text-white"
                              : "bg-transparent text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Paste URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoticeImageMode("upload")}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            noticeImageMode === "upload"
                              ? "bg-violet-500 text-white"
                              : "bg-transparent text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Upload className="inline h-3 w-3 mr-1" />
                          Upload
                        </button>
                      </div>
                    </div>
                    {noticeImageMode === "url" ? (
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={siteNoticeForm.bannerImage}
                        onChange={(e) => setSiteNoticeForm((current) => ({ ...current, bannerImage: e.target.value }))}
                      />
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingNoticeBanner}
                          onClick={() => document.getElementById("notice-banner-upload")?.click()}
                        >
                          {uploadingNoticeBanner ? "Uploading..." : "Choose Image"}
                        </Button>
                        <input
                          id="notice-banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            void handleSiteNoticeBannerUpload(file);
                            e.target.value = "";
                          }}
                        />
                        <span className="text-xs text-slate-500">File will be uploaded to Cloudinary</span>
                      </div>
                    )}
                    {siteNoticeForm.bannerImage && (
                      <img
                        src={siteNoticeForm.bannerImage}
                        alt="Popup banner preview"
                        className="h-24 w-full rounded-lg border border-slate-200 object-cover sm:h-28"
                      />
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Button label (optional)"
                      value={siteNoticeForm.buttonLabel}
                      onChange={(e) => setSiteNoticeForm((current) => ({ ...current, buttonLabel: e.target.value }))}
                    />
                    <Input
                      placeholder="Button URL (optional)"
                      value={siteNoticeForm.buttonUrl}
                      onChange={(e) => setSiteNoticeForm((current) => ({ ...current, buttonUrl: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button type="button" onClick={handleSaveSiteNotice} className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Save Popup
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSiteNoticeForm(emptySiteNoticeForm)}
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {events.slice(0, 3).map((event) => (
                      <div key={event.slug} className="flex items-start justify-between rounded-lg border border-slate-200 p-3">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{event.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{event.slug}</p>
                        </div>
                        <Badge variant={event.isPublished ? "default" : "secondary"}>
                          {event.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Blog Posts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {posts.slice(0, 3).map((post) => (
                      <div key={post.slug} className="flex items-start justify-between rounded-lg border border-slate-200 p-3">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{post.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{post.slug}</p>
                        </div>
                        <Badge variant={post.isPublished ? "default" : "secondary"}>
                          {post.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <AdminAnalyticsOverview
              members={members}
              investors={investorLeads}
              partners={partners}
              activityStartups={activityStartups}
              activityInvestors={activityInvestors}
            />
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Events Management</h2>
                  <p className="text-slate-600 mt-1">Create, edit, or manage event content</p>
                </div>
                <Button
                  onClick={() => { setShowEventForm(true); setSelectedEventSlug(""); setEventForm(emptyEventForm); }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Event
                </Button>
              </div>

              {showEventForm && (
                <Card className="border-2 border-violet-200 bg-violet-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>{selectedEventSlug ? "Edit Event" : "Create New Event"}</CardTitle>
                      <CardDescription>One line per list item. For FAQs use `question || answer` format.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setShowEventForm(false); setSelectedEventSlug(""); setEventForm(emptyEventForm); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white rounded-b-lg p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Event Slug (e.g. bangalore-founder-connect)" value={eventForm.slug} onChange={(e) => setEventForm((c) => ({ ...c, slug: e.target.value }))} />
                      <Input placeholder="Event Title *" value={eventForm.title} onChange={(e) => setEventForm((c) => ({ ...c, title: e.target.value }))} />
                    </div>
                    <Input placeholder="Subtitle (One line summary)" value={eventForm.subtitle} onChange={(e) => setEventForm((c) => ({ ...c, subtitle: e.target.value }))} />
                    <Textarea placeholder="Short Description *" value={eventForm.shortDescription} onChange={(e) => setEventForm((c) => ({ ...c, shortDescription: e.target.value }))} />
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Date & Time Label (e.g. Sat, Aug 15, 2026 • 5:00 PM)" value={eventForm.dateLabel} onChange={(e) => setEventForm((c) => ({ ...c, dateLabel: e.target.value }))} />
                      <Input placeholder="Location Label (e.g. Indiranagar, Bangalore)" value={eventForm.locationLabel} onChange={(e) => setEventForm((c) => ({ ...c, locationLabel: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Input
                        placeholder="Google Maps URL (paste the share link from Google Maps)"
                        value={eventForm.mapUrl}
                        onChange={(e) => setEventForm((c) => ({ ...c, mapUrl: e.target.value }))}
                      />
                      {eventForm.mapUrl && (
                        <div className="overflow-hidden rounded-lg border border-slate-200">
                          <EventMapPreview mapUrl={eventForm.mapUrl} className="h-56 w-full" title="Event location preview" />
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="External Registration URL (Link to Luma/Eventbrite)" value={eventForm.registrationUrl} onChange={(e) => setEventForm((c) => ({ ...c, registrationUrl: e.target.value }))} />
                      <Input placeholder="Ticket Label (e.g. Free RSVP / Invite Only)" value={eventForm.ticketLabel} onChange={(e) => setEventForm((c) => ({ ...c, ticketLabel: e.target.value }))} />
                    </div>

                    {/* --- DUAL IMAGE UPLOADER: DESKTOP & MOBILE --- */}
                    <div className="grid gap-6 md:grid-cols-2 pt-2 border-t border-b pb-4 my-2">
                      {/* 1. Desktop Image */}
                      <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Image className="w-4 h-4 text-purple-600" />
                            Desktop View Poster/Banner *
                          </label>
                          <div className="flex gap-1 rounded bg-white p-0.5 border text-[11px]">
                            <button
                              type="button"
                              onClick={() => setEventImageMode("url")}
                              className={`px-2 py-0.5 rounded font-medium ${eventImageMode === "url" ? "bg-purple-600 text-white" : "text-slate-600"}`}
                            >
                              URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setEventImageMode("upload")}
                              className={`px-2 py-0.5 rounded font-medium ${eventImageMode === "upload" ? "bg-purple-600 text-white" : "text-slate-600"}`}
                            >
                              Upload
                            </button>
                          </div>
                        </div>

                        {eventImageMode === "url" ? (
                          <Input
                            placeholder="https://example.com/desktop-banner.jpg"
                            value={eventForm.bannerImage}
                            onChange={(e) => setEventForm((c) => ({ ...c, bannerImage: e.target.value }))}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={uploadingEventBanner}
                              onClick={() => document.getElementById("event-banner-upload")?.click()}
                              className="text-xs"
                            >
                              {uploadingEventBanner ? "Uploading..." : "Upload Desktop Image"}
                            </Button>
                            <input
                              id="event-banner-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                void handleEventBannerUpload(file);
                                e.target.value = "";
                              }}
                            />
                          </div>
                        )}

                        <p className="text-[11px] font-medium text-slate-500 bg-purple-50/70 p-2 rounded border border-purple-100">
                          📏 <strong>Recommended Desktop Size:</strong> 1920 × 1080 px (Aspect Ratio 16:9)
                        </p>

                        {eventForm.bannerImage && (
                          <img
                            src={eventForm.bannerImage}
                            alt="Desktop preview"
                            className="h-28 w-full rounded-lg border object-cover shadow-sm"
                          />
                        )}
                      </div>

                      {/* 2. Mobile Image */}
                      <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Image className="w-4 h-4 text-indigo-600" />
                            Mobile View Poster/Banner
                          </label>
                          <div className="flex gap-1 rounded bg-white p-0.5 border text-[11px]">
                            <button
                              type="button"
                              onClick={() => setEventMobileImageMode("url")}
                              className={`px-2 py-0.5 rounded font-medium ${eventMobileImageMode === "url" ? "bg-indigo-600 text-white" : "text-slate-600"}`}
                            >
                              URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setEventMobileImageMode("upload")}
                              className={`px-2 py-0.5 rounded font-medium ${eventMobileImageMode === "upload" ? "bg-indigo-600 text-white" : "text-slate-600"}`}
                            >
                              Upload
                            </button>
                          </div>
                        </div>

                        {eventMobileImageMode === "url" ? (
                          <Input
                            placeholder="https://example.com/mobile-poster.jpg"
                            value={eventForm.mobileBannerImage}
                            onChange={(e) => setEventForm((c) => ({ ...c, mobileBannerImage: e.target.value }))}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={uploadingEventMobileBanner}
                              onClick={() => document.getElementById("event-mobile-banner-upload")?.click()}
                              className="text-xs"
                            >
                              {uploadingEventMobileBanner ? "Uploading..." : "Upload Mobile Image"}
                            </Button>
                            <input
                              id="event-mobile-banner-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                void handleEventMobileBannerUpload(file);
                                e.target.value = "";
                              }}
                            />
                          </div>
                        )}

                        <p className="text-[11px] font-medium text-slate-500 bg-indigo-50/70 p-2 rounded border border-indigo-100">
                          📏 <strong>Recommended Mobile Size:</strong> 800 × 1200 px (Aspect Ratio 4:5 or 9:16 Portrait)
                        </p>

                        {eventForm.mobileBannerImage && (
                          <img
                            src={eventForm.mobileBannerImage}
                            alt="Mobile preview"
                            className="h-28 w-20 mx-auto rounded-lg border object-cover shadow-sm"
                          />
                        )}
                      </div>
                    </div>

                    <Input placeholder="Host / Organizer Name" value={eventForm.hostName} onChange={(e) => setEventForm((c) => ({ ...c, hostName: e.target.value }))} />
                    <Textarea placeholder="About Event (one paragraph per line)" rows={3} value={eventForm.about} onChange={(e) => setEventForm((c) => ({ ...c, about: e.target.value }))} />
                    <Textarea placeholder="Tags / Categories (comma or line separated)" rows={2} value={eventForm.tags} onChange={(e) => setEventForm((c) => ({ ...c, tags: e.target.value }))} />
                    <Textarea placeholder="FAQs (format: question || answer)" rows={3} value={eventForm.faqs} onChange={(e) => setEventForm((c) => ({ ...c, faqs: e.target.value }))} />
                    
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="event-published"
                          checked={eventForm.isPublished}
                          onChange={(e) => setEventForm((c) => ({ ...c, isPublished: e.target.checked }))}
                          className="h-4 w-4"
                        />
                        <label htmlFor="event-published" className="text-sm font-medium text-slate-700 cursor-pointer">
                          Publish Event
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="event-slider"
                          checked={eventForm.featuredOnSlider}
                          onChange={(e) => setEventForm((c) => ({ ...c, featuredOnSlider: e.target.checked }))}
                          className="h-4 w-4"
                        />
                        <label htmlFor="event-slider" className="text-sm font-medium text-slate-700 cursor-pointer">
                          Feature on Hero Slider
                        </label>
                      </div>
                      
                      {eventForm.featuredOnSlider && (
                        <div className="ml-6">
                          <Input
                            type="number"
                            placeholder="Slider Order (0 = first)"
                            value={eventForm.sliderOrder}
                            onChange={(e) => setEventForm((c) => ({ ...c, sliderOrder: Number(e.target.value) }))}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button onClick={handleSaveEvent} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {selectedEventSlug ? "Update Event" : "Create Event"}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowEventForm(false); setSelectedEventSlug(""); setEventForm(emptyEventForm); }}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No events yet. Create your first event!</p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.slug} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900">{event.title}</h3>
                              <Badge variant={event.isPublished ? "default" : "secondary"}>
                                {event.isPublished ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{event.slug}</p>
                            <p className="text-sm text-slate-600 line-clamp-1">{event.shortDescription}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEventSlug(event.slug);
                                setEventForm({
                                  slug: event.slug,
                                  title: event.title,
                                  subtitle: event.subtitle,
                                  shortDescription: event.shortDescription,
                                  bannerImage: event.bannerImage,
                                  mobileBannerImage: (event as any).mobileBannerImage || "",
                                  bannerAlt: event.bannerAlt,
                                  hostName: event.hostName,
                                  hostLogoText: event.hostLogoText,
                                  dateLabel: event.dateLabel,
                                  locationLabel: event.locationLabel,
                                  mapUrl: event.mapUrl,
                                  calendarUrl: event.calendarUrl,
                                  registrationUrl: event.registrationUrl,
                                  ticketLabel: event.ticketLabel,
                                  refundPolicy: event.refundPolicy,
                                  about: event.about.join("\n"),
                                  expectations: event.expectations.join("\n"),
                                  differentiators: event.differentiators.join("\n"),
                                  audience: event.audience.join("\n"),
                                  tags: event.tags.join("\n"),
                                  photos: event.photos.join("\n"),
                                  videos: event.videos.join("\n"),
                                  faqs: serializeFaqs(event.faqs),
                                  isPublished: event.isPublished ?? true,
                                  featuredOnSlider: event.featuredOnSlider ?? false,
                                  sliderOrder: event.sliderOrder ?? 0,
                                });
                                setShowEventForm(true);
                              }}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (window.confirm(`Delete event "${event.title}"?`)) {
                                  deleteAdminEventApi(token, event.slug)
                                    .then((response) => {
                                      window.alert(response.message);
                                      loadAdminData();
                                    })
                                    .catch((error) => window.alert(error instanceof Error ? error.message : "Unable to delete event."));
                                }
                              }}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Blogs Tab */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Blog Management</h2>
                  <p className="text-slate-600 mt-1">Create, edit, or manage blog posts</p>
                </div>
                <Button
                  onClick={() => { setShowBlogForm(true); setSelectedBlogSlug(""); setBlogForm(emptyBlogForm); }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </div>

              {showBlogForm && (
                <Card className="border-2 border-violet-200 bg-violet-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>{selectedBlogSlug ? "Edit Blog Post" : "Create New Blog Post"}</CardTitle>
                      <CardDescription>For sections use `heading || content` on separate lines.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setShowBlogForm(false); setSelectedBlogSlug(""); setBlogForm(emptyBlogForm); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white rounded-b-lg p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Slug (optional)" value={blogForm.slug} onChange={(e) => setBlogForm((c) => ({ ...c, slug: e.target.value }))} />
                      <Input placeholder="Title *" value={blogForm.title} onChange={(e) => setBlogForm((c) => ({ ...c, title: e.target.value }))} />
                    </div>
                    <Textarea placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm((c) => ({ ...c, excerpt: e.target.value }))} />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input placeholder="Author" value={blogForm.author} onChange={(e) => setBlogForm((c) => ({ ...c, author: e.target.value }))} />
                      <Input placeholder="Date" value={blogForm.date} onChange={(e) => setBlogForm((c) => ({ ...c, date: e.target.value }))} />
                      <Input placeholder="Read Time" value={blogForm.readTime} onChange={(e) => setBlogForm((c) => ({ ...c, readTime: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Cover Image *</label>
                        <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => setBlogImageMode("url")}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              blogImageMode === "url"
                                ? "bg-violet-500 text-white"
                                : "bg-transparent text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Paste URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setBlogImageMode("upload")}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              blogImageMode === "upload"
                                ? "bg-violet-500 text-white"
                                : "bg-transparent text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Upload className="inline h-3 w-3 mr-1" />
                            Upload File
                          </button>
                        </div>
                      </div>
                      {blogImageMode === "url" ? (
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={blogForm.coverImage}
                          onChange={(e) => setBlogForm((c) => ({ ...c, coverImage: e.target.value }))}
                        />
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingBlogCover}
                            onClick={() => document.getElementById("blog-cover-upload")?.click()}
                          >
                            {uploadingBlogCover ? "Uploading..." : "Choose Image"}
                          </Button>
                          <input
                            id="blog-cover-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              void handleBlogCoverUpload(file);
                              e.target.value = "";
                            }}
                          />
                          <span className="text-xs text-slate-500">File will be uploaded to Cloudinary</span>
                        </div>
                      )}
                      {blogForm.coverImage && (
                        <img
                          src={blogForm.coverImage}
                          alt={blogForm.title || "Blog cover preview"}
                          className="h-28 w-full rounded-lg border border-slate-200 object-cover sm:h-36"
                        />
                      )}
                    </div>
                    <Textarea placeholder="Tags (one per line)" value={blogForm.tags} onChange={(e) => setBlogForm((c) => ({ ...c, tags: e.target.value }))} />
                    <Textarea placeholder="Sections: heading || content" value={blogForm.sections} onChange={(e) => setBlogForm((c) => ({ ...c, sections: e.target.value }))} />
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button onClick={handleSaveBlog} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {selectedBlogSlug ? "Update Post" : "Create Post"}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowBlogForm(false); setSelectedBlogSlug(""); setBlogForm(emptyBlogForm); }}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {posts.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No blog posts yet. Create your first post!</p>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.slug} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900">{post.title}</h3>
                              <Badge variant={post.isPublished ? "default" : "secondary"}>
                                {post.isPublished ? "Published" : "Draft"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{post.slug}</p>
                            <p className="text-sm text-slate-600 line-clamp-1">{post.excerpt}</p>
                            <div className="flex gap-2 items-center mt-2 text-xs text-slate-500">
                              <span>By {post.author}</span>
                              <span>•</span>
                              <span>{post.date}</span>
                              <span>•</span>
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBlogSlug(post.slug);
                                setBlogForm({
                                  slug: post.slug,
                                  title: post.title,
                                  excerpt: post.excerpt,
                                  author: post.author,
                                  date: post.date,
                                  readTime: post.readTime,
                                  coverImage: post.coverImage,
                                  tags: post.tags.join("\n"),
                                  sections: serializeSections(post.sections),
                                  isPublished: post.isPublished ?? true,
                                });
                                setShowBlogForm(true);
                              }}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (window.confirm(`Delete blog post "${post.title}"?`)) {
                                  deleteAdminBlogApi(token, post.slug)
                                    .then((response) => {
                                      window.alert(response.message);
                                      loadAdminData();
                                    })
                                    .catch((error) => window.alert(error instanceof Error ? error.message : "Unable to delete blog post."));
                                }
                              }}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Members & Requests</h2>
                <p className="text-slate-600 mt-1">Manage members and guest event requests</p>
              </div>

              {showMemberForm && (
                <Card className="border-2 border-violet-200 bg-violet-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>Add New Member</CardTitle>
                      <CardDescription>Enter details to manually register a new member in the ecosystem.</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowMemberForm(false);
                        setMemberForm({
                          fullName: "",
                          email: "",
                          password: "",
                          phone: "",
                          city: "",
                          role: "user",
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white rounded-b-lg p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        type="text"
                        placeholder="Full Name *"
                        value={memberForm.fullName}
                        onChange={(e) => setMemberForm((c) => ({ ...c, fullName: e.target.value }))}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Email Address *"
                        value={memberForm.email}
                        onChange={(e) => setMemberForm((c) => ({ ...c, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input
                        type="password"
                        placeholder="Password *"
                        value={memberForm.password}
                        onChange={(e) => setMemberForm((c) => ({ ...c, password: e.target.value }))}
                        required
                      />
                      <Input
                        type="tel"
                        placeholder="Phone Number *"
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm((c) => ({ ...c, phone: e.target.value }))}
                        required
                      />
                      <Input
                        type="text"
                        placeholder="City *"
                        value={memberForm.city}
                        onChange={(e) => setMemberForm((c) => ({ ...c, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Ecosystem Role</label>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={memberForm.role}
                          onChange={(e) => setMemberForm((c) => ({ ...c, role: e.target.value }))}
                        >
                          <option value="user">General User / Builder</option>
                          <option value="founder">Founder</option>
                          <option value="investor">Investor</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowMemberForm(false);
                          setMemberForm({
                            fullName: "",
                            email: "",
                            password: "",
                            phone: "",
                            city: "",
                            role: "user",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveMember} disabled={savingMember}>
                        {savingMember ? "Saving Member..." : "Save Member"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle>Members List</CardTitle>
                          <CardDescription>All registered members and their details</CardDescription>
                        </div>
                        <Button onClick={() => setShowMemberForm(true)} className="gap-2 self-start sm:self-auto">
                          <Plus className="h-4 w-4" />
                          Add Member
                        </Button>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Input
                          placeholder="Search members by name, email, city or role..."
                          value={searchMembers}
                          onChange={(e) => setSearchMembers(e.target.value)}
                          className="h-9 w-full"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {filteredMembers.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No members found matching your search</p>
                      ) : (
                        filteredMembers.map((member) => (
                          <div key={member._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900">{member.fullName}</h4>
                                <p className="text-sm text-slate-500 mt-1">{member.email}</p>
                                <div className="flex gap-2 items-center mt-2 text-xs">
                                  <Badge>{member.role}</Badge>
                                  <Badge variant="outline">{member.city}</Badge>
                                </div>
                              </div>
                              <div className="flex flex-col items-end justify-between min-h-[4.5rem]">
                                <div className="text-right">
                                  <p className="text-xs text-slate-500">
                                    {new Date(member.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    Login: {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : "Never"}
                                  </p>
                                </div>
                                {member.role !== "admin" && member.role !== "superadmin" && (
                                  <div className="flex items-center gap-1 mt-2">
                                    {account?.role === "superadmin" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handlePromoteMemberToAdmin(member._id, member.fullName)}
                                        className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 h-8 w-8"
                                        title="Make Admin"
                                      >
                                        <ShieldCheck className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteMember(member._id, member.fullName)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                      title="Delete Member"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Member Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <p className="text-xs font-medium text-blue-600">Total Members</p>
                        <p className="text-2xl font-bold text-blue-900">{members.length}</p>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-xs font-medium text-green-600">Active Today</p>
                        <p className="text-2xl font-bold text-green-900">
                          {members.filter(m => new Date(m.lastLoginAt || 0).toDateString() === new Date().toDateString()).length}
                        </p>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <p className="text-xs font-medium text-purple-600">Admins</p>
                        <p className="text-2xl font-bold text-purple-900">{members.filter(m => m.role === "admin" || m.role === "superadmin").length}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Guest Event Requests</CardTitle>
                  <CardDescription>Non-member submissions from the public event form</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {interests.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No guest requests yet</p>
                  ) : (
                    interests.map((interest) => (
                      <div key={interest._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div>
                              <Badge className="mb-2">{interest.title}</Badge>
                              <h4 className="font-semibold text-slate-900">{interest.fullName}</h4>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{interest.email}</p>
                            {interest.note && <p className="text-sm text-slate-600 mt-2 italic">"{interest.note}"</p>}
                            <div className="flex flex-wrap gap-2 items-center mt-2 text-xs text-slate-500">
                              <span>📍 {interest.city}</span>
                              <span>📱 {interest.phone}</span>
                              <span>📅 {new Date(interest.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <CardTitle>Join Us Form Submissions</CardTitle>
                      <CardDescription>Data submitted from the Join Us page.</CardDescription>
                    </div>
                    <div className="ml-4">
                      <Button variant="outline" size="sm" onClick={() => exportToCSV(joinRequests, "join-requests")}>Export CSV</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {joinRequests.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No join requests yet</p>
                  ) : (
                    joinRequests.map((request) => {
                      const status = request.status || "pending";
                      const isUpdating = updatingJoinRequestId === request._id;
                      return (
                        <div key={request._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{request.name}</h4>
                              <p className="text-sm text-slate-500 mt-1">{request.email} · {request.phone}</p>
                              <p className="text-xs text-slate-500 mt-2">{request.occupation} · {request.companyName} · {request.city}</p>
                              <p className="text-sm text-slate-600 mt-2 italic">"{request.whyJoin}"</p>
                              <p className="text-xs text-slate-400 mt-2">Source: {request.referralSource}</p>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              <p>{request.createdAt ? new Date(request.createdAt).toLocaleString() : "Unknown date"}</p>
                              <Badge
                                className="mt-2 capitalize"
                                variant={status === "approved" ? "default" : status === "denied" ? "destructive" : "secondary"}
                              >
                                {status}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-3 text-sm">
                              {request.linkedinProfile && (
                                <a className="text-primary hover:underline" href={request.linkedinProfile} target="_blank" rel="noreferrer">LinkedIn</a>
                              )}
                              {request.website && (
                                <a className="text-primary hover:underline" href={request.website} target="_blank" rel="noreferrer">Website</a>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant={status === "pending" ? "secondary" : "outline"}
                                disabled={isUpdating || status === "pending"}
                                onClick={() => handleJoinRequestStatus(request._id, "pending")}
                                className="gap-1.5"
                              >
                                <Clock3 className="h-3.5 w-3.5" />
                                Pending
                              </Button>
                              <Button
                                size="sm"
                                disabled={isUpdating || status === "approved"}
                                onClick={() => handleJoinRequestStatus(request._id, "approved")}
                                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isUpdating || status === "denied"}
                                onClick={() => handleJoinRequestStatus(request._id, "denied")}
                                className="gap-1.5"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Deny
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Partners Tab */}
          {activeTab === "partners" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Partners Management</h2>
                  <p className="text-slate-600 mt-1">Review partnership inquiries and manage dynamic partner logos.</p>
                </div>
                <Button
                  onClick={() => {
                    setShowPartnerForm(true);
                    setSelectedPartnerId("");
                    setPartnerForm(emptyPartnerForm);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Partner
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <CardTitle>Partnership Form Submissions</CardTitle>
                      <CardDescription>Structured data submitted from the Partner With Us page.</CardDescription>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <select value={partnerTypeFilter} onChange={(e) => setPartnerTypeFilter(e.target.value)} className="rounded border border-border bg-background px-3 py-2 text-sm">
                        <option value="">All partnership types</option>
                        {partnerTypes.map((t) => <option key={t.slug} value={t.name}>{t.name}</option>)}
                      </select>
                      <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredPartnerInquiries, "partner-inquiries")}>Export CSV</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredPartnerInquiries.length === 0 ? (
                    <p className="py-8 text-center text-slate-500">No partnership inquiries yet.</p>
                  ) : (
                    filteredPartnerInquiries.map((inquiry) => (
                      <div key={inquiry._id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900">{inquiry.companyName}</h3>
                              <Badge variant="secondary">{inquiry.partnershipType}</Badge>
                              <select
                                value={inquiry.status === "reviewed" ? "pending" : inquiry.status}
                                disabled={updatingPartnerInquiryId === inquiry._id}
                                onChange={(e) =>
                                  handlePartnerInquiryStatus(inquiry._id, e.target.value as "pending" | "approved" | "rejected")
                                }
                                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize cursor-pointer disabled:opacity-50 ${
                                  inquiry.status === "approved"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : inquiry.status === "rejected"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approve</option>
                                <option value="rejected">Deny</option>
                              </select>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">
                              {inquiry.contactPerson} · {inquiry.email} · {inquiry.phone || "No phone"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString() : "Unknown date"}
                            </p>
                          </div>
                          <div className="text-sm text-slate-600 lg:text-right">
                            <p>{inquiry.companyType || "Company type not shared"}</p>
                            <p>{inquiry.city || "City not shared"}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Goal</p>
                            <p className="mt-1 text-sm text-slate-800">{inquiry.partnershipGoal || "Not shared"}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Audience</p>
                            <p className="mt-1 text-sm text-slate-800">{inquiry.audienceSize || "Not shared"}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Budget</p>
                            <p className="mt-1 text-sm text-slate-800">{inquiry.budgetRange || "Not shared"}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase text-slate-500">Timeline</p>
                            <p className="mt-1 text-sm text-slate-800">{inquiry.timeline || "Not shared"}</p>
                          </div>
                        </div>

                        {inquiry.message && (
                          <div className="mt-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                            {inquiry.message}
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                          {inquiry.website && <a className="text-primary hover:underline" href={inquiry.website} target="_blank" rel="noreferrer">Website</a>}
                          {inquiry.linkedin && <a className="text-primary hover:underline" href={inquiry.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                          {inquiry.twitter && <a className="text-primary hover:underline" href={inquiry.twitter} target="_blank" rel="noreferrer">Twitter/X</a>}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {showPartnerForm && (
                <Card className="border-2 border-violet-200 bg-violet-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>{selectedPartnerId ? "Edit Partner" : "Add Partner"}</CardTitle>
                      <CardDescription>Name and Logo are required.</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPartnerForm(false);
                        setSelectedPartnerId("");
                        setPartnerForm(emptyPartnerForm);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white rounded-b-lg p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        type="text"
                        placeholder="Partner Name *"
                        value={partnerForm.name || ""}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setPartnerForm((current) => ({ ...current, name: value }));
                        }}
                        required
                      />
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={partnerForm.category || "general"}
                        onChange={(e) => setPartnerForm((c) => ({ ...c, category: e.target.value as any }))}
                      >
                        <option value="general">General Partner</option>
                        <option value="college">College Partner</option>
                        <option value="ecell">E-Cell Partner</option>
                        <option value="sponsor">Sponsor / Supporter</option>
                      </select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-1">
                      <Input
                        placeholder="Display Order"
                        type="number"
                        value={partnerForm.order || "0"}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setPartnerForm((current) => ({ ...current, order: value }));
                        }}
                      />
                    </div>
                    <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Image className="w-4 h-4 text-purple-600" />
                          Logo *
                        </label>
                        <div className="flex gap-1 rounded bg-white p-0.5 border text-[11px]">
                          <button
                            type="button"
                            onClick={() => setPartnerLogoMode("url")}
                            className={`px-2 py-0.5 rounded font-medium ${partnerLogoMode === "url" ? "bg-purple-600 text-white" : "text-slate-600"}`}
                          >
                            URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartnerLogoMode("upload")}
                            className={`px-2 py-0.5 rounded font-medium ${partnerLogoMode === "upload" ? "bg-purple-600 text-white" : "text-slate-600"}`}
                          >
                            Upload
                          </button>
                        </div>
                      </div>

                      {partnerLogoMode === "url" ? (
                        <Input
                          type="text"
                          placeholder="Logo URL *"
                          value={partnerForm.logoUrl || ""}
                          onChange={(e) => {
                            const value = e.currentTarget.value;
                            setPartnerForm((current) => ({ ...current, logoUrl: value }));
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingPartnerLogo}
                            onClick={() => document.getElementById("partner-logo-upload")?.click()}
                            className="text-xs"
                          >
                            {uploadingPartnerLogo ? "Uploading..." : "Upload Logo Image"}
                          </Button>
                          <input
                            id="partner-logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              void handlePartnerLogoUpload(file);
                              e.target.value = "";
                            }}
                          />
                        </div>
                      )}

                      {partnerForm.logoUrl && (
                        <img
                          src={partnerForm.logoUrl}
                          alt="Logo preview"
                          className="h-16 max-w-full rounded-lg border bg-white object-contain p-2 shadow-sm"
                        />
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="Website URL (optional)"
                      value={partnerForm.websiteUrl || ""}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setPartnerForm((current) => ({ ...current, websiteUrl: value }));
                      }}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="text"
                        placeholder="Logo Width (e.g. 120px, 100%, auto)"
                        value={partnerForm.logoWidth || "auto"}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setPartnerForm((current) => ({ ...current, logoWidth: value }));
                        }}
                      />
                      <Input
                        type="text"
                        placeholder="Logo Height (e.g. 80px, 100%, auto)"
                        value={partnerForm.logoHeight || "auto"}
                        onChange={(e) => {
                          const value = e.currentTarget.value;
                          setPartnerForm((current) => ({ ...current, logoHeight: value }));
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="partner-active"
                        type="checkbox"
                        checked={partnerForm.isActive}
                        onChange={(e) => setPartnerForm((current) => ({ ...current, isActive: e.target.checked }))}
                      />
                      <label htmlFor="partner-active" className="text-sm text-slate-700">Active on landing page</label>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button 
                        onClick={handleSavePartner} 
                        className="gap-2" 
                        disabled={savingPartner}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {savingPartner ? 'Saving...' : selectedPartnerId ? 'Update Partner' : 'Create Partner'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPartnerForm(false);
                          setSelectedPartnerId("");
                          setPartnerForm(emptyPartnerForm);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {partners.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 text-center">
                      <Handshake className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No partners yet. Add your first partner logo.</p>
                    </CardContent>
                  </Card>
                ) : (
                  partners.map((partner) => (
                    <Card key={partner._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {partner.logoUrl ? (
                              <img src={partner.logoUrl} alt={partner.name} className="h-20 w-40 rounded border border-slate-200 object-contain bg-white p-1" />
                            ) : (
                              <div className="h-20 w-40 rounded border border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-center">No logo</div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900">{partner.name}</h3>
                                <Badge variant={partner.isActive ? "default" : "secondary"}>
                                  {partner.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline" className="capitalize text-[10px]">
                                  {partner.category || "general"}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">Order: {partner.order ?? 0}</p>
                              <p className="text-xs text-slate-500 mt-1 break-all">{partner.websiteUrl || "No website URL"}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPartnerId(partner._id);
                                setPartnerForm({
                                  name: partner.name || "",
                                  category: partner.category || "general",
                                  logoUrl: partner.logoUrl || "",
                                  websiteUrl: partner.websiteUrl || "",
                                  logoWidth: partner.logoWidth || "auto",
                                  logoHeight: partner.logoHeight || "auto",
                                  order: String(partner.order ?? 0),
                                  isActive: Boolean(partner.isActive),
                                });
                                setShowPartnerForm(true);
                              }}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (window.confirm(`Delete partner "${partner.name}"?`)) {
                                  deleteAdminPartnerApi(token, partner._id)
                                    .then((response) => {
                                      window.alert(response.message);
                                      loadAdminData();
                                    })
                                    .catch((error) => window.alert(error instanceof Error ? error.message : "Unable to delete partner."));
                                }
                              }}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>Gallery Management</CardTitle>
                        <CardDescription>Upload images that appear on the gallery page and landing section.</CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setShowGalleryForm(true);
                          setSelectedGalleryId("");
                          setGalleryForm(emptyGalleryForm);
                        }}
                        className="gap-2"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Image
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {showGalleryForm && (
                      <div className="space-y-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{selectedGalleryId ? "Edit Gallery Image" : "Add Gallery Image"}</p>
                            <p className="text-xs text-slate-500">Title and Image are required.</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowGalleryForm(false);
                              setSelectedGalleryId("");
                              setGalleryForm(emptyGalleryForm);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Input
                            placeholder="Title *"
                            value={galleryForm.title}
                            onChange={(e) => setGalleryForm((current) => ({ ...current, title: e.target.value }))}
                          />
                          <Input
                            placeholder="Event Name (e.g. Founders Meetup 2024)"
                            value={galleryForm.eventName}
                            onChange={(e) => setGalleryForm((current) => ({ ...current, eventName: e.target.value }))}
                          />
                          <Input
                            placeholder="Order"
                            type="number"
                            value={galleryForm.order}
                            onChange={(e) => setGalleryForm((current) => ({ ...current, order: e.target.value }))}
                          />
                        </div>
                        <Input
                          placeholder="Image URL *"
                          value={galleryForm.imageUrl}
                          onChange={(e) => setGalleryForm((current) => ({ ...current, imageUrl: e.target.value }))}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingGalleryImage}
                            onClick={() => document.getElementById("gallery-image-upload")?.click()}
                          >
                            {uploadingGalleryImage ? "Uploading..." : "Upload Image"}
                          </Button>
                          <input
                            id="gallery-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              void handleGalleryImageUpload(file);
                              e.target.value = "";
                            }}
                          />
                          <span className="text-xs text-slate-500">Uploads to Cloudinary and fills the URL automatically.</span>
                        </div>
                        {galleryForm.imageUrl && (
                          <img src={galleryForm.imageUrl} alt={galleryForm.altText || galleryForm.title || "Gallery preview"} className="h-40 w-full rounded-lg border border-slate-200 object-cover" />
                        )}
                        <Input
                          placeholder="Alt text"
                          value={galleryForm.altText}
                          onChange={(e) => setGalleryForm((current) => ({ ...current, altText: e.target.value }))}
                        />
                        <Input
                          placeholder="Caption"
                          value={galleryForm.caption}
                          onChange={(e) => setGalleryForm((current) => ({ ...current, caption: e.target.value }))}
                        />
                        <Input
                          placeholder="Link URL (optional)"
                          value={galleryForm.linkUrl}
                          onChange={(e) => setGalleryForm((current) => ({ ...current, linkUrl: e.target.value }))}
                        />
                        <div className="flex items-center gap-3">
                          <input
                            id="gallery-active"
                            type="checkbox"
                            checked={galleryForm.isActive}
                            onChange={(e) => setGalleryForm((current) => ({ ...current, isActive: e.target.checked }))}
                          />
                          <label htmlFor="gallery-active" className="text-sm text-slate-700">Show on gallery page</label>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button onClick={handleSaveGalleryImage} disabled={savingGallery} className="gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {savingGallery ? "Saving..." : selectedGalleryId ? "Update Image" : "Create Image"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowGalleryForm(false);
                              setSelectedGalleryId("");
                              setGalleryForm(emptyGalleryForm);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {galleryImages.length === 0 ? (
                        <p className="py-8 text-center text-slate-500">No gallery images yet.</p>
                      ) : (
                        galleryImages.map((image) => (
                          <div key={image._id} className="flex items-start gap-4 rounded-xl border border-slate-200 p-4">
                            <img src={image.imageUrl} alt={image.altText || image.title} className="h-20 w-28 rounded-lg border border-slate-200 object-cover" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-slate-900">{image.title}</h4>
                                {image.eventName && <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50">{image.eventName}</Badge>}
                                <Badge variant={image.isActive ? "default" : "secondary"}>{image.isActive ? "Active" : "Hidden"}</Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Order: {image.order ?? 0}</p>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{image.caption || image.altText || image.imageUrl}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedGalleryId(image._id);
                                  setGalleryForm({
                                    title: image.title || "",
                                    eventName: image.eventName || "",
                                    imageUrl: image.imageUrl || "",
                                    altText: image.altText || "",
                                    caption: image.caption || "",
                                    linkUrl: image.linkUrl || "",
                                    order: String(image.order ?? 0),
                                    isActive: Boolean(image.isActive),
                                  });
                                  setShowGalleryForm(true);
                                }}
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (window.confirm(`Delete gallery image "${image.title}"?`)) {
                                    deleteAdminGalleryApi(token, image._id)
                                      .then((response) => {
                                        window.alert(response.message);
                                        loadAdminData();
                                      })
                                      .catch((error) => window.alert(error instanceof Error ? error.message : "Unable to delete gallery image."));
                                  }
                                }}
                                className="gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>Testimonials Management</CardTitle>
                        <CardDescription>Add testimonials that appear on the landing page.</CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setShowTestimonialForm(true);
                          setSelectedTestimonialId("");
                          setTestimonialForm(emptyTestimonialForm);
                        }}
                        className="gap-2"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Testimonial
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {showTestimonialForm && (
                      <div className="space-y-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{selectedTestimonialId ? "Edit Testimonial" : "Add Testimonial"}</p>
                            <p className="text-xs text-slate-500">Name, Role, and Quote are required.</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowTestimonialForm(false);
                              setSelectedTestimonialId("");
                              setTestimonialForm(emptyTestimonialForm);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input placeholder="Name *" value={testimonialForm.name} onChange={(e) => setTestimonialForm((current) => ({ ...current, name: e.target.value }))} />
                          <Input placeholder="Role *" value={testimonialForm.role} onChange={(e) => setTestimonialForm((current) => ({ ...current, role: e.target.value }))} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input placeholder="Initials" value={testimonialForm.initials} onChange={(e) => setTestimonialForm((current) => ({ ...current, initials: e.target.value }))} />
                          <Input placeholder="Order" type="number" value={testimonialForm.order} onChange={(e) => setTestimonialForm((current) => ({ ...current, order: e.target.value }))} />
                        </div>
                        <Textarea placeholder="Quote *" value={testimonialForm.quote} onChange={(e) => setTestimonialForm((current) => ({ ...current, quote: e.target.value }))} />
                        <Input placeholder="Avatar URL (optional)" value={testimonialForm.avatarUrl} onChange={(e) => setTestimonialForm((current) => ({ ...current, avatarUrl: e.target.value }))} />
                        <div className="flex items-center gap-3">
                          <input
                            id="testimonial-active"
                            type="checkbox"
                            checked={testimonialForm.isActive}
                            onChange={(e) => setTestimonialForm((current) => ({ ...current, isActive: e.target.checked }))}
                          />
                          <label htmlFor="testimonial-active" className="text-sm text-slate-700">Show on landing page</label>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button onClick={handleSaveTestimonial} disabled={savingTestimonial} className="gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {savingTestimonial ? "Saving..." : selectedTestimonialId ? "Update Testimonial" : "Create Testimonial"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowTestimonialForm(false);
                              setSelectedTestimonialId("");
                              setTestimonialForm(emptyTestimonialForm);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {testimonials.length === 0 ? (
                        <p className="py-8 text-center text-slate-500">No testimonials yet.</p>
                      ) : (
                        testimonials.map((testimonial) => (
                          <div key={testimonial._id} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                {testimonial.avatarUrl ? (
                                  <img src={testimonial.avatarUrl} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                                    {(testimonial.initials || testimonial.name.slice(0, 2)).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                                    <Badge variant={testimonial.isActive ? "default" : "secondary"}>{testimonial.isActive ? "Active" : "Hidden"}</Badge>
                                  </div>
                                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                                  <p className="mt-2 text-sm text-slate-700 line-clamp-3">“{testimonial.quote}”</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTestimonialId(testimonial._id);
                                    setTestimonialForm({
                                      name: testimonial.name || "",
                                      role: testimonial.role || "",
                                      initials: testimonial.initials || "",
                                      quote: testimonial.quote || "",
                                      avatarUrl: testimonial.avatarUrl || "",
                                      order: String(testimonial.order ?? 0),
                                      isActive: Boolean(testimonial.isActive),
                                    });
                                    setShowTestimonialForm(true);
                                  }}
                                  className="gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (window.confirm(`Delete testimonial "${testimonial.name}"?`)) {
                                      deleteAdminTestimonialApi(token, testimonial._id)
                                        .then((response) => {
                                          window.alert(response.message);
                                          loadAdminData();
                                        })
                                        .catch((error) => window.alert(error instanceof Error ? error.message : "Unable to delete testimonial."));
                                    }
                                  }}
                                  className="gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === "newsletter" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Subscribers</CardTitle>
                  <CardDescription>Manage newsletter signups and subscriber status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subscribers.length === 0 ? (
                    <p className="py-8 text-center text-slate-500">No newsletter subscribers yet.</p>
                  ) : (
                    subscribers.map((subscriber) => (
                      <div key={subscriber._id} className="flex items-start justify-between rounded-lg border border-slate-200 p-4">
                        <div>
                          <p className="font-medium text-slate-900">{subscriber.name || subscriber.email}</p>
                          <p className="text-sm text-slate-500">{subscriber.email}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleString() : "Unknown date"}
                          </p>
                        </div>
                        <Badge variant={subscriber.isActive ? "default" : "secondary"}>
                          {subscriber.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Email Automation Tab */}
          {activeTab === "automation" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Email Automation</CardTitle>
                    <CardDescription>Send bulk campaigns to subscribers, members, or everyone.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Audience</label>
                        <select
                          value={newsletterAudience}
                          onChange={(e) => setNewsletterAudience(e.target.value as NewsletterAudience)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="subscribers">Active newsletter subscribers</option>
                          <option value="members">Active members</option>
                          <option value="everyone">Everyone</option>
                          <option value="custom">Custom pasted email list</option>
                        </select>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-500">Estimated recipients</p>
                        <p className="text-2xl font-bold text-slate-900">{recipientCountForAudience}</p>
                        {newsletterAudience === "custom" && (
                          <p className="mt-1 text-xs text-slate-500">
                            Parsed: {customRecipientStats.totalParsed} | Invalid: {customRecipientStats.invalid} | Duplicates: {customRecipientStats.duplicates}
                          </p>
                        )}
                      </div>
                    </div>
                    {newsletterAudience === "custom" && (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Paste emails (1000+ supported)</label>
                        <Textarea
                          placeholder="Paste emails separated by newline, comma, semicolon, or space"
                          value={customRecipientInput}
                          onChange={(e) => setCustomRecipientInput(e.target.value)}
                          className="min-h-36 font-mono text-sm"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Tip: invalid or duplicate emails are ignored automatically. Campaign logs keep sent/failed tracking.
                        </p>
                      </div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Template</label>
                        <div className="flex gap-2">
                          <select
                            value={selectedTemplateId || ''}
                            onChange={(e) => setSelectedTemplateId(e.target.value || null)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                          >
                            <option value="">Custom HTML</option>
                            {templates.map((t) => (
                              <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                          </select>
                          <Button size="sm" variant="outline" onClick={() => setShowTemplateForm((s) => !s)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Template
                          </Button>
                        </div>
                      </div>
                      <div />
                    </div>
                    {showTemplateForm && (
                      <Card className="border-dashed border-slate-200 bg-white/50">
                        <CardHeader>
                          <CardTitle>Create Template</CardTitle>
                          <CardDescription>{"Reusable templates with Handlebars variables (e.g. {{name}})"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Input placeholder="Template name" value={templateForm.name} onChange={(e) => setTemplateForm((c) => ({ ...c, name: e.target.value }))} />
                          <Input placeholder="Subject" value={templateForm.subject} onChange={(e) => setTemplateForm((c) => ({ ...c, subject: e.target.value }))} />
                          <Textarea placeholder="HTML with {{variables}}" value={templateForm.html} onChange={(e) => setTemplateForm((c) => ({ ...c, html: e.target.value }))} className="min-h-32 font-mono text-sm mt-2" />
                          <div className="flex gap-2 mt-2">
                            <Button onClick={() => {
                              createAdminTemplateApi(token, templateForm)
                                .then((r) => { window.alert(r.message); setShowTemplateForm(false); setTemplateForm({ name: '', subject: '', html: '' }); loadAdminData(); })
                                .catch((err) => window.alert(err instanceof Error ? err.message : 'Unable to create template'));
                            }}>
                              Save Template
                            </Button>
                            <Button variant="outline" onClick={() => setShowTemplateForm(false)}>Cancel</Button>
                            <Button variant="ghost" onClick={() => {
                              previewAdminTemplateApi(token, { html: templateForm.html, variables: { name: 'Test' } })
                                .then((r) => { window.open('about:blank').document.write(r.html); })
                                .catch((err) => window.alert(err instanceof Error ? err.message : 'Preview failed'));
                            }}>Preview</Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    <Input
                      placeholder="Subject"
                      value={newsletterForm.subject}
                      onChange={(e) => setNewsletterForm((current) => ({ ...current, subject: e.target.value }))}
                    />
                    <Textarea
                      placeholder={`HTML body\nUse <p>, <a>, <strong>, etc.`}
                      value={newsletterForm.html}
                      onChange={(e) => setNewsletterForm((current) => ({ ...current, html: e.target.value }))}
                      className="min-h-64 font-mono text-sm"
                    />
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Schedule for later</label>
                      <Input
                        type="datetime-local"
                        value={campaignScheduledAt}
                        onChange={(e) => setCampaignScheduledAt(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleSendAutomation} disabled={newsletterSending} className="gap-2">
                        <Send className="h-4 w-4" />
                        {newsletterSending
                          ? "Scheduling..."
                          : campaignScheduledAt
                            ? `Schedule ${recipientCountForAudience} recipients`
                            : `Send to ${recipientCountForAudience} recipients`}
                      </Button>
                      <Button variant="outline" onClick={() => setNewsletterForm(emptyNewsletterForm)} disabled={newsletterSending}>
                        Reset
                      </Button>
                    </div>
                    {newsletterResult && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">
                          Delivery summary: {newsletterResult.sent}/{newsletterResult.total} sent
                        </p>
                        {newsletterResult.audience && (
                          <p className="mt-1 text-xs text-slate-500">
                            Audience: {newsletterResult.audience}
                          </p>
                        )}
                        {newsletterResult.recipientUpload && (
                          <p className="mt-1 text-xs text-slate-500">
                            Parsed: {newsletterResult.recipientUpload.totalParsed} | Accepted: {newsletterResult.recipientUpload.accepted} | Invalid: {newsletterResult.recipientUpload.invalid} | Duplicates: {newsletterResult.recipientUpload.duplicates}
                          </p>
                        )}
                        {newsletterResult.failed > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="font-medium text-red-700">{newsletterResult.failed} failed</p>
                            {newsletterResult.failures.slice(0, 5).map((failure) => (
                              <p key={failure.email} className="text-xs text-slate-500">
                                {failure.email}: {failure.message}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audience Stats</CardTitle>
                    <CardDescription>Current available recipient pools</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-xs font-medium text-blue-600">Active Subscribers</p>
                      <p className="text-2xl font-bold text-blue-900">{newsletterRecipientCounts.subscribers}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="text-xs font-medium text-green-600">Active Members</p>
                      <p className="text-2xl font-bold text-green-900">{newsletterRecipientCounts.members}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3">
                      <p className="text-xs font-medium text-amber-600">Everyone</p>
                      <p className="text-2xl font-bold text-amber-900">{newsletterRecipientCounts.everyone}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Automation Preview</CardTitle>
                  <CardDescription>Preview uses the same HTML entered above.</CardDescription>
                </CardHeader>
                <CardContent>
                  {newsletterForm.html.trim() ? (
                    <div
                      className="min-h-40 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-900"
                      dangerouslySetInnerHTML={{ __html: newsletterForm.html }}
                    />
                  ) : (
                    <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                      Add HTML content above to preview the automation email.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign History</CardTitle>
                    <CardDescription>Recently created campaigns with status and audience.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {campaigns.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-500">No campaigns yet.</p>
                    ) : (
                      campaigns.map((campaign) => (
                        <button
                          key={campaign._id}
                          type="button"
                          onClick={() => loadCampaignDetails(campaign._id)}
                          className={`w-full rounded-lg border p-4 text-left transition-colors ${
                            selectedCampaignId === campaign._id
                              ? "border-violet-400 bg-violet-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{campaign.name}</p>
                              <p className="text-xs text-slate-500">{campaign.subject}</p>
                            </div>
                            <Badge variant="secondary">{campaign.status}</Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
                            <span>Total: {campaign.stats?.total ?? 0}</span>
                            <span>Sent: {campaign.stats?.sent ?? 0}</span>
                            <span>Failed: {campaign.stats?.failed ?? 0}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Logs</CardTitle>
                    <CardDescription>Recipient delivery entries for the selected campaign.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {campaignLogs.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-500">Select a campaign to view logs.</p>
                    ) : (
                      campaignLogs.slice(0, 20).map((log) => (
                        <div key={`${log.to}-${log.createdAt}`} className="flex items-start justify-between rounded-lg border border-slate-200 p-3">
                          <div>
                            <p className="font-medium text-slate-900">{log.to}</p>
                            <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</p>
                            {log.error && <p className="mt-1 text-xs text-red-600">{log.error}</p>}
                          </div>
                          <Badge variant={log.status === "sent" ? "default" : "secondary"}>{log.status}</Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Promotions Tab */}
          {activeTab === "promotions" && (
            <div className="space-y-6">
              {showPromotionForm && (
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle>{selectedPromotionId ? "Edit Promotion" : "Create New Promotion"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Title *</label>
                      <Input
                        placeholder="Promotion title"
                        value={promotionForm.title}
                        onChange={(e) => setPromotionForm((c) => ({ ...c, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <Textarea
                        placeholder="Promotion description"
                        value={promotionForm.description}
                        onChange={(e) => setPromotionForm((c) => ({ ...c, description: e.target.value }))}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Image Mode</label>
                      <div className="flex gap-3 mt-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="url"
                            checked={promotionImageMode === "url"}
                            onChange={(e) => setPromotionImageMode(e.target.value as ImageInputMode)}
                          />
                          <span className="text-sm">URL</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            value="upload"
                            checked={promotionImageMode === "upload"}
                            onChange={(e) => setPromotionImageMode(e.target.value as ImageInputMode)}
                          />
                          <span className="text-sm">Upload</span>
                        </label>
                      </div>
                    </div>
                    {promotionImageMode === "url" ? (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Image URL *</label>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={promotionForm.imageUrl}
                          onChange={(e) => setPromotionForm((c) => ({ ...c, imageUrl: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Upload Image *</label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            // File upload handler would go here
                            if (e.target.files?.[0]) {
                              window.alert("Image upload feature requires Cloudinary integration. Use URL mode for now.");
                            }
                          }}
                          className="mt-1"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-slate-700">Alt Text</label>
                      <Input
                        placeholder="Image alt text"
                        value={promotionForm.altText}
                        onChange={(e) => setPromotionForm((c) => ({ ...c, altText: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Link URL</label>
                      <Input
                        placeholder="https://example.com"
                        value={promotionForm.linkUrl}
                        onChange={(e) => setPromotionForm((c) => ({ ...c, linkUrl: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Button Label</label>
                      <Input
                        placeholder="View More"
                        value={promotionForm.buttonLabel}
                        onChange={(e) => setPromotionForm((c) => ({ ...c, buttonLabel: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Order</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={promotionForm.order}
                          onChange={(e) => setPromotionForm((c) => ({ ...c, order: Number(e.target.value) }))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={promotionForm.isActive}
                            onChange={(e) => setPromotionForm((c) => ({ ...c, isActive: e.target.checked }))}
                          />
                          <span className="text-sm font-medium text-slate-700">Active</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button onClick={handleSavePromotion} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {selectedPromotionId ? "Update" : "Create"}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowPromotionForm(false); setPromotionForm(emptySliderPromotionForm); setSelectedPromotionId(""); }}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!showPromotionForm && (
                <Button onClick={() => setShowPromotionForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Promotion
                </Button>
              )}

              <div className="grid gap-4">
                {promotions.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 text-center">
                      <Image className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No promotions yet. Create your first promotion!</p>
                    </CardContent>
                  </Card>
                ) : (
                  promotions.map((promotion) => (
                    <Card key={promotion._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <img src={promotion.imageUrl} alt={promotion.altText} className="w-20 h-20 object-cover rounded" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <h3 className="font-bold text-slate-900">{promotion.title}</h3>
                              <Badge variant={promotion.isActive ? "default" : "secondary"}>
                                {promotion.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{promotion.description}</p>
                            <p className="text-xs text-slate-500">Order: {promotion.order} | Created by ID: {promotion.createdBy}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPromotionForm({
                                  title: promotion.title,
                                  description: promotion.description,
                                  imageUrl: promotion.imageUrl,
                                  altText: promotion.altText,
                                  linkUrl: promotion.linkUrl,
                                  buttonLabel: promotion.buttonLabel,
                                  order: promotion.order,
                                  isActive: promotion.isActive,
                                  createdBy: promotion.createdBy,
                                });
                                setSelectedPromotionId(promotion._id);
                                setShowPromotionForm(true);
                              }}
                              className="gap-1"
                            >
                              <Edit size={16} />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (window.confirm("Delete this promotion?")) {
                                  deleteAdminSliderPromotionApi(token, promotion._id)
                                    .then((response) => {
                                      window.alert(response.message);
                                      loadAdminData();
                                    })
                                    .catch((error) => {
                                      window.alert(error instanceof Error ? error.message : "Failed to delete");
                                    });
                                }
                              }}
                              className="gap-1"
                            >
                              <Trash2 size={16} />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Funding Tab */}
          {activeTab === "funding" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Funding Applications</h2>
                  <p className="text-slate-600 mt-1">Founders seeking investment through our platform.</p>
                </div>
                <Button variant="outline" onClick={() => exportToCSV(fundingApplications, "funding-applications")} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications ({fundingApplications.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50/50">
                          <th className="px-4 py-3 font-semibold text-slate-700">Startup</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Founder</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Sector</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">MRR</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 text-right">Pitch Deck</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {fundingApplications.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No applications found.</td></tr>
                        ) : (
                          fundingApplications.map((app) => (
                            <tr key={app._id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-4 py-4">
                                <p className="font-bold text-slate-900">{app.startupName}</p>
                                <p className="text-xs text-slate-500 truncate max-w-[150px]">{app.brief}</p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-medium">{app.name}</p>
                                <p className="text-xs text-slate-500">{app.mobile}</p>
                                <p className="text-xs text-slate-500">{app.email}</p>
                              </td>
                              <td className="px-4 py-4">
                                <Badge variant="outline">{app.sector === "Other" ? app.sectorOther : app.sector}</Badge>
                              </td>
                              <td className="px-4 py-4 font-medium text-violet-700">
                                {app.mrr === "Other" ? app.mrrOther : app.mrr}
                              </td>
                              <td className="px-4 py-4">
                                <Badge variant={
                                  app.status === "approved" ? "default" : 
                                  app.status === "rejected" ? "destructive" : 
                                  "secondary"
                                }>
                                  {app.status.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="px-4 py-4 text-xs text-slate-500">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-4 text-right">
                                {app.pitchDeckUrl ? (
                                  <a href={app.pitchDeckUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors">
                                    <FileText size={14} /> VIEW DECK
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No Deck</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                 <Card className="bg-slate-900 text-white border-none">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <TrendingUp className="text-primary" size={20} />
                       Investment Insight
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <p className="text-slate-400 text-sm">Review applications carefully. Funding matching is based on the sector and growth Stage.</p>
                     <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[75%] shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                     </div>
                     <p className="text-xs text-slate-500 uppercase tracking-widest font-black italic">Platform Interest Index: HIGH</p>
                   </CardContent>
                 </Card>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Bangalore Event Data</h2>
                  <p className="text-sm text-slate-500">View and export real-time registrations for startups and investors.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const emails = [...new Set([
                        ...activityStartups.map(s => s.founderEmail),
                        ...activityInvestors.map(i => i.email)
                      ])].join(", ");
                      navigator.clipboard.writeText(emails);
                      window.alert("All emails copied to clipboard!");
                    }}
                    className="gap-2"
                  >
                    <Mail size={16} />
                    Copy All Emails
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      exportToCSV(activityStartups, "bangalore-startups");
                      exportToCSV(activityInvestors, "bangalore-investors");
                    }}
                    className="gap-2"
                  >
                    <FileText size={16} />
                    Export CSVs
                  </Button>
                </div>
              </div>

              {/* Startups Table */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle>Registered Startups ({activityStartups.length})</CardTitle>
                  <CardDescription>Startups participating in the Bangalore event.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 border-b">
                        <tr>
                          <th className="p-4 font-medium">Startup</th>
                          <th className="p-4 font-medium">Founder</th>
                          <th className="p-4 font-medium">Email</th>
                          <th className="p-4 font-medium">Category / Stage</th>
                          <th className="p-4 font-medium">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activityStartups.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500">No startups registered yet.</td>
                          </tr>
                        ) : (
                          activityStartups.map((startup) => (
                            <tr key={startup.id} className="hover:bg-slate-50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {startup.logoUrl && <img src={startup.logoUrl} alt="" className="w-8 h-8 rounded object-cover" />}
                                  <div>
                                    <p className="font-semibold text-slate-900">{startup.startupName}</p>
                                    <p className="text-xs text-slate-500">{startup.tagline}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">{startup.founderName}</td>
                              <td className="p-4">{startup.founderEmail}</td>
                              <td className="p-4">
                                <Badge variant="secondary" className="mr-2">{startup.category}</Badge>
                                <Badge variant="outline">{startup.stage}</Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1 font-semibold">
                                  ⭐ {Number(startup.averageScore || 0).toFixed(1)}
                                  <span className="text-xs text-slate-400">({startup.totalRatingsCount || 0})</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Investors Table */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle>Registered Investors ({activityInvestors.length})</CardTitle>
                  <CardDescription>Investors participating in the Bangalore event.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 border-b">
                        <tr>
                          <th className="p-4 font-medium">Investor</th>
                          <th className="p-4 font-medium">Firm</th>
                          <th className="p-4 font-medium">Email</th>
                          <th className="p-4 font-medium">Designation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activityInvestors.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">No investors registered yet.</td>
                          </tr>
                        ) : (
                          activityInvestors.map((investor) => (
                            <tr key={investor.id} className="hover:bg-slate-50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {investor.photoUrl ? <img src={investor.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-slate-200" />}
                                  <p className="font-semibold text-slate-900">{investor.fullName}</p>
                                </div>
                              </td>
                              <td className="p-4">{investor.firmName}</td>
                              <td className="p-4">{investor.email}</td>
                              <td className="p-4">{investor.designation}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "investor-invites" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Investor Invite Links</h2>
                <p className="text-sm text-slate-500">
                  Investor sign-up is invite-only. Generate a link here and share it directly with the investor —
                  anyone with the link can fill out the registration form.
                </p>
              </div>

              <Card className="border-2 border-violet-200 bg-violet-50">
                <CardHeader className="pb-4">
                  <CardTitle>Generate New Invite Link</CardTitle>
                  <CardDescription>Optionally label it (e.g. an investor's name) and set an expiry.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 bg-white rounded-b-lg p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      placeholder="Label (optional) — e.g. Rohan Mehta, Elevate Capital"
                      value={newInviteLabel}
                      onChange={(e) => setNewInviteLabel(e.target.value)}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Expires in days (optional, leave blank for no expiry)"
                      value={newInviteExpiryDays}
                      onChange={(e) => setNewInviteExpiryDays(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateInvestorInvite} disabled={creatingInvite} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {creatingInvite ? "Generating..." : "Generate Invite Link"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle>All Invite Links ({investorInvites.length})</CardTitle>
                  <CardDescription>Track usage and revoke access at any time.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 border-b">
                        <tr>
                          <th className="p-4 font-medium">Label</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Uses</th>
                          <th className="p-4 font-medium">Expires</th>
                          <th className="p-4 font-medium">Created</th>
                          <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {investorInvites.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                              No invite links yet. Generate one above to get started.
                            </td>
                          </tr>
                        ) : (
                          investorInvites.map((invite) => {
                            const expired = Boolean(invite.expiresAt && new Date(invite.expiresAt) < new Date());
                            return (
                              <tr key={invite._id} className="hover:bg-slate-50">
                                <td className="p-4">
                                  <p className="font-medium text-slate-900">{invite.label || "Untitled invite"}</p>
                                  <p className="text-xs text-slate-400 font-mono">{invite.token.slice(0, 16)}...</p>
                                </td>
                                <td className="p-4">
                                  {!invite.isActive ? (
                                    <Badge variant="secondary" className="bg-slate-200 text-slate-600">Revoked</Badge>
                                  ) : expired ? (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">Expired</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                                  )}
                                </td>
                                <td className="p-4">{invite.usageCount}</td>
                                <td className="p-4">{invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : "Never"}</td>
                                <td className="p-4">{new Date(invite.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button variant="outline" size="sm" onClick={() => handleCopyInviteLink(invite.token)} className="gap-1.5">
                                      <Copy className="h-3.5 w-3.5" />
                                      Copy Link
                                    </Button>
                                    {invite.isActive ? (
                                      <Button variant="outline" size="sm" onClick={() => handleRevokeInvestorInvite(invite._id)} className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50">
                                        <Ban className="h-3.5 w-3.5" />
                                        Revoke
                                      </Button>
                                    ) : (
                                      <Button variant="outline" size="sm" onClick={() => handleReactivateInvestorInvite(invite._id)} className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50">
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Reactivate
                                      </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => handleDeleteInvestorInvite(invite._id)} className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Team & Access Tab (superadmin only) */}
          {activeTab === "team" && (
            account?.role !== "superadmin" ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  Only super admins can manage team access.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="border-2 border-violet-200 bg-violet-50">
                  <CardHeader className="pb-4">
                    <CardTitle>Give Admin Access</CardTitle>
                    <CardDescription>
                      Creates an account with a generated password and emails the login details automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="bg-white rounded-b-lg p-4">
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          placeholder="Full name"
                          value={newAdminForm.fullName}
                          onChange={(e) => setNewAdminForm((c) => ({ ...c, fullName: e.target.value }))}
                          required
                        />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm((c) => ({ ...c, email: e.target.value }))}
                          required
                        />
                        <Input
                          placeholder="Phone number"
                          value={newAdminForm.phone}
                          onChange={(e) => setNewAdminForm((c) => ({ ...c, phone: e.target.value }))}
                          required
                        />
                        <Input
                          placeholder="City"
                          value={newAdminForm.city}
                          onChange={(e) => setNewAdminForm((c) => ({ ...c, city: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={newAdminForm.role}
                          onChange={(e) => setNewAdminForm((c) => ({ ...c, role: e.target.value as "admin" | "superadmin" }))}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                        <Button type="submit" disabled={creatingAdmin} className="gap-2">
                          <KeyRound className="h-4 w-4" />
                          {creatingAdmin ? "Creating..." : "Create & Email Credentials"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {justCreatedAdmin && (
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{justCreatedAdmin.message}</p>
                          <p className="mt-2 text-sm text-slate-600">
                            Email: <span className="font-mono">{justCreatedAdmin.account.email}</span>
                          </p>
                          <p className="text-sm text-slate-600">
                            Temporary password: <span className="font-mono font-bold">{justCreatedAdmin.generatedPassword}</span>
                          </p>
                          {!justCreatedAdmin.emailSent && (
                            <p className="mt-2 text-sm font-medium text-amber-700">
                              The email failed to send — copy this password and share it manually.
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard?.writeText(justCreatedAdmin.generatedPassword).catch(() => {});
                          }}
                          className="gap-2 shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Password
                        </Button>
                      </div>
                      <Button size="sm" variant="ghost" className="mt-3" onClick={() => setJustCreatedAdmin(null)}>
                        Dismiss
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle>Admins ({admins.length})</CardTitle>
                    <CardDescription>Manage roles or remove admin access.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                          <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {loadingAdmins ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading admins...</td></tr>
                          ) : admins.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No admins found.</td></tr>
                          ) : (
                            admins.map((admin) => {
                              const isSelf = admin.email === account?.email;
                              const isUpdating = updatingAdminId === admin._id;
                              return (
                                <tr key={admin._id} className="hover:bg-slate-50">
                                  <td className="p-4 font-semibold text-slate-900">
                                    {admin.fullName} {isSelf && <span className="text-xs text-slate-400">(you)</span>}
                                  </td>
                                  <td className="p-4 text-slate-700">{admin.email}</td>
                                  <td className="p-4">
                                    <select
                                      value={admin.role}
                                      disabled={isSelf || isUpdating}
                                      onChange={(e) => handleUpdateAdminRole(admin._id, e.target.value as "admin" | "superadmin")}
                                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize disabled:opacity-50"
                                    >
                                      <option value="admin">Admin</option>
                                      <option value="superadmin">Super Admin</option>
                                    </select>
                                  </td>
                                  <td className="p-4">
                                    <Badge variant={admin.isActive ? "default" : "secondary"}>{admin.isActive ? "Active" : "Inactive"}</Badge>
                                  </td>
                                  <td className="p-4 text-right">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={isSelf || isUpdating}
                                      onClick={() => handleDeleteAdmin(admin._id, admin.fullName)}
                                      className="gap-1.5"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Delete
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle>Activity History</CardTitle>
                    <CardDescription>What every admin has done across the dashboard, most recent first.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-50 text-slate-500 border-b">
                          <tr>
                            <th className="p-4 font-medium">Admin</th>
                            <th className="p-4 font-medium">Action</th>
                            <th className="p-4 font-medium">Target</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">When</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {loadingAuditLogs ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading activity...</td></tr>
                          ) : auditLogs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No activity recorded yet.</td></tr>
                          ) : (
                            auditLogs.map((log) => (
                              <tr key={log._id} className="hover:bg-slate-50">
                                <td className="p-4">
                                  <p className="font-medium text-slate-900">{log.actorName}</p>
                                  <p className="text-xs text-slate-400 capitalize">{log.actorRole}</p>
                                </td>
                                <td className="p-4 font-mono text-xs text-slate-700">{log.action}</td>
                                <td className="p-4 text-slate-600">
                                  {log.targetCollection}
                                  {log.targetId ? ` · ${log.targetId.slice(-6)}` : ""}
                                </td>
                                <td className="p-4">
                                  <Badge variant={(log.statusCode ?? 0) < 400 ? "default" : "destructive"}>
                                    {log.statusCode ?? "—"}
                                  </Badge>
                                </td>
                                <td className="p-4 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}

          {/* Admin Chat Tab */}
          {activeTab === "chat" && (
            <Card className="flex h-[70vh] flex-col">
              <CardHeader className="border-b">
                <CardTitle>Admin Chat</CardTitle>
                <CardDescription>Shared channel for all admins and super admins.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 overflow-y-auto p-4">
                {chatMessages.length === 0 ? (
                  <p className="py-12 text-center text-slate-500">No messages yet. Say hello!</p>
                ) : (
                  chatMessages.map((msg) => {
                    const isSelf = msg.senderId === account?.id;
                    const mentionsMe = Boolean(account?.id && msg.mentions?.includes(account.id));
                    const nameParts = msg.message.split(/(@[A-Za-z]+(?:\s[A-Za-z]+)?)/g);
                    return (
                      <div key={msg._id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isSelf ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-900"
                          } ${mentionsMe ? "ring-2 ring-amber-400" : ""}`}
                        >
                          {!isSelf && (
                            <p className="mb-0.5 text-xs font-semibold opacity-70">
                              {msg.senderName} <span className="capitalize">· {msg.senderRole}</span>
                            </p>
                          )}
                          {mentionsMe && (
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-500">You were tagged</p>
                          )}
                          <p className="text-sm break-words">
                            {nameParts.map((part, idx) =>
                              part.startsWith("@") ? (
                                <span key={idx} className={`font-semibold ${isSelf ? "text-violet-100" : "text-violet-700"}`}>
                                  {part}
                                </span>
                              ) : (
                                <span key={idx}>{part}</span>
                              ),
                            )}
                          </p>
                          <p className={`mt-1 text-[10px] ${isSelf ? "text-violet-200" : "text-slate-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </CardContent>
              <form onSubmit={handleSendChatMessage} className="relative flex items-center gap-2 border-t p-3">
                {mentionMatches.length > 0 && (
                  <div className="absolute bottom-full left-3 mb-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    {mentionMatches.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => handlePickMention(p)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-900">{p.fullName}</span>
                        <span className="text-xs capitalize text-slate-400">{p.role}</span>
                      </button>
                    ))}
                  </div>
                )}
                <Input
                  placeholder="Message the team... (type @ to tag someone)"
                  value={chatInput}
                  onChange={(e) => handleChatInputChange(e.target.value)}
                  disabled={sendingChat}
                  className="flex-1"
                />
                <Button type="submit" disabled={sendingChat || !chatInput.trim()} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </form>
            </Card>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              {account?.role === "superadmin" && (
                <Card className="border-2 border-violet-200 bg-violet-50">
                  <CardHeader className="pb-4">
                    <CardTitle>Create Task</CardTitle>
                    <CardDescription>Assign it to an admin now, or leave unassigned and assign later.</CardDescription>
                  </CardHeader>
                  <CardContent className="bg-white rounded-b-lg p-4">
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <Input
                        placeholder="Task title"
                        value={newTaskForm.title}
                        onChange={(e) => setNewTaskForm((c) => ({ ...c, title: e.target.value }))}
                        required
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={newTaskForm.description}
                        onChange={(e) => setNewTaskForm((c) => ({ ...c, description: e.target.value }))}
                        className="min-h-20"
                      />
                      <div className="grid gap-4 sm:grid-cols-3">
                        <select
                          value={newTaskForm.priority}
                          onChange={(e) => setNewTaskForm((c) => ({ ...c, priority: e.target.value as "low" | "medium" | "high" }))}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="low">Low priority</option>
                          <option value="medium">Medium priority</option>
                          <option value="high">High priority</option>
                        </select>
                        <Input
                          type="date"
                          value={newTaskForm.dueAt}
                          onChange={(e) => setNewTaskForm((c) => ({ ...c, dueAt: e.target.value }))}
                        />
                        <select
                          value={newTaskForm.assignedTo}
                          onChange={(e) => setNewTaskForm((c) => ({ ...c, assignedTo: e.target.value }))}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">Unassigned</option>
                          {admins.map((admin) => (
                            <option key={admin._id} value={admin._id}>{admin.fullName}</option>
                          ))}
                        </select>
                      </div>
                      <Button type="submit" disabled={creatingTaskItem} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {creatingTaskItem ? "Creating..." : "Create Task"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tasks ({tasks.length})</CardTitle>
                      <CardDescription>
                        {account?.role === "superadmin" ? "Assign, track, and manage tasks." : "Tasks assigned across the team."}
                      </CardDescription>
                    </div>
                    <select
                      value={taskStatusFilter}
                      onChange={(e) => setTaskStatusFilter(e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">All statuses</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {loadingTasks ? (
                    <p className="py-8 text-center text-slate-500">Loading tasks...</p>
                  ) : tasks.length === 0 ? (
                    <p className="py-8 text-center text-slate-500">No tasks yet.</p>
                  ) : (
                    tasks.map((task) => {
                      const isUpdating = updatingTaskId === task._id;
                      return (
                        <div key={task._id} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-semibold text-slate-900">{task.title}</h4>
                                <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"} className="capitalize">
                                  {task.priority}
                                </Badge>
                              </div>
                              {task.description && <p className="mt-1 text-sm text-slate-600">{task.description}</p>}
                              <p className="mt-2 text-xs text-slate-500">
                                Assigned to: {task.assignedTo?.fullName || "Unassigned"}
                                {task.dueAt && ` · Due ${new Date(task.dueAt).toLocaleDateString()}`}
                                {" · Created by "}{task.createdBy?.fullName || "—"}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={task.status}
                                disabled={isUpdating}
                                onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value as "open" | "in_progress" | "done")}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize disabled:opacity-50"
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                              {account?.role === "superadmin" && (
                                <>
                                  <select
                                    value={task.assignedTo?._id || ""}
                                    disabled={isUpdating}
                                    onChange={(e) => handleAssignTask(task._id, e.target.value)}
                                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
                                  >
                                    <option value="">Unassigned</option>
                                    {admins.map((admin) => (
                                      <option key={admin._id} value={admin._id}>{admin.fullName}</option>
                                    ))}
                                  </select>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={isUpdating}
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="gap-1.5"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
