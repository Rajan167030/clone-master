import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  createAdminPartnerApi,
  createAdminBlogApi,
  createAdminEventApi,
  deleteAdminPartnerApi,
  deleteAdminBlogApi,
  deleteAdminEventApi,
  getAdminBlogsApi,
  getAdminEventInterestsApi,
  getAdminEventsApi,
  getAdminMembersApi,
  getAdminNewsletterSubscribersApi,
  getAdminTemplatesApi,
  getAdminJoinRequestsApi,
  getAdminPartnerInquiriesApi,
  getAdminPartnersApi,
  getAdminSiteNoticeApi,
  updateAdminPartnerApi,
  updateAdminBlogApi,
  updateAdminEventApi,
  updateAdminSiteNoticeApi,
  type AdminEventInterest,
  type AdminJoinRequest,
  type AdminMember,
  type DynamicBlogPost,
  type DynamicEvent,
  type NewsletterAudience,
  type NewsletterSubscriber,
  type EmailTemplate,
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
  type Campaign,
} from "@/lib/api";
import { getToken, getAccount } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Upload,
} from "lucide-react";

const emptyEventForm = {
  slug: "",
  title: "",
  subtitle: "",
  shortDescription: "",
  bannerImage: "",
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
  buttonLabel: "",
  buttonUrl: "",
  isActive: false,
};

const emptyNewsletterForm = {
  subject: "",
  html: "",
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
};

const emptyPartnerForm = {
  name: "",
  logoUrl: "",
  websiteUrl: "",
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
  const [partnerInquiries, setPartnerInquiries] = useState<PartnerInquiry[]>([]);
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
  const [newsletterSending, setNewsletterSending] = useState(false);
  const [newsletterResult, setNewsletterResult] = useState<NewsletterSendSummary | null>(null);
  const [partnerForm, setPartnerForm] = useState(emptyPartnerForm);
  const [selectedEventSlug, setSelectedEventSlug] = useState("");
  const [selectedBlogSlug, setSelectedBlogSlug] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "events" | "blogs" | "members" | "partners" | "newsletter" | "automation">("dashboard");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [uploadingEventBanner, setUploadingEventBanner] = useState(false);
  const [uploadingBlogCover, setUploadingBlogCover] = useState(false);
  const [eventImageMode, setEventImageMode] = useState<ImageInputMode>("url");
  const [blogImageMode, setBlogImageMode] = useState<ImageInputMode>("url");

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

  const newsletterRecipientCounts = useMemo(() => {
    const subscriberEmails = new Set(
      subscribers.filter((subscriber) => subscriber.isActive).map((subscriber) => normalizeEmail(subscriber.email)),
    );
    const memberEmails = new Set(
      members.filter((member) => member.isActive && member.role !== "admin").map((member) => normalizeEmail(member.email)),
    );
    const joinRequestEmails = new Set(joinRequests.map((request) => normalizeEmail(request.email)));

    return {
      subscribers: subscriberEmails.size,
      members: memberEmails.size,
      everyone: new Set<string>([...subscriberEmails, ...memberEmails, ...joinRequestEmails]).size,
    };
  }, [joinRequests, members, subscribers]);

  const recipientCountForAudience =
    newsletterAudience === "subscribers"
      ? newsletterRecipientCounts.subscribers
      : newsletterAudience === "members"
        ? newsletterRecipientCounts.members
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
      getAdminPartnerInquiriesApi(token),
      getAdminSiteNoticeApi(token),
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
        partnerInquiriesResponse,
        noticeResponse,
      ]) => {
        setEvents(eventsResponse.events);
        setPosts(blogsResponse.posts);
        setMembers(membersResponse.members);
        setInterests(interestsResponse.interests);
        setJoinRequests(joinRequestsResponse.requests);
        setSubscribers(subscribersResponse.subscribers);
        setPartners(partnersResponse.partners);
        setPartnerInquiries(partnerInquiriesResponse.inquiries);
        setTemplates(templatesResponse.templates || []);
        setCampaigns(campaignsResponse.campaigns || []);
        setSiteNoticeForm(
          noticeResponse.notice
            ? {
                title: noticeResponse.notice.title || "Announcement",
                message: noticeResponse.notice.message || "",
                buttonLabel: noticeResponse.notice.buttonLabel || "",
                buttonUrl: noticeResponse.notice.buttonUrl || "",
                isActive: Boolean(noticeResponse.notice.isActive),
              }
            : emptySiteNoticeForm,
        );
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load admin data.");
      });
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSaveEvent = () => {
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
          buttonLabel: response.notice.buttonLabel || "",
          buttonUrl: response.notice.buttonUrl || "",
          isActive: Boolean(response.notice.isActive),
        });
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save site notice.");
      });
  };

  const handleSendAutomation = () => {
    if (!newsletterForm.subject.trim() || !newsletterForm.html.trim()) {
      window.alert("Please add a subject and HTML content before sending.");
      return;
    }

    if (recipientCountForAudience === 0) {
      window.alert("There are no recipients for the selected audience.");
      return;
    }

    const confirmed = window.confirm(
      `Send this email to ${recipientCountForAudience} recipient${recipientCountForAudience === 1 ? "" : "s"}?`,
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
    })
      .then((response) => {
        window.alert(response.message);
        setNewsletterResult({ total: response.total, sent: 0, failed: 0, failures: [] });
        setNewsletterForm(emptyNewsletterForm);
        setNewsletterAudience("everyone");
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

  const handleSavePartner = () => {
    if (!partnerForm.name.trim()) {
      window.alert("Partner name is required.");
      return;
    }

    const payload = {
      name: partnerForm.name.trim(),
      logoUrl: partnerForm.logoUrl.trim(),
      websiteUrl: partnerForm.websiteUrl.trim(),
      order: Number(partnerForm.order || 0),
      isActive: partnerForm.isActive,
    };

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
          <div className="rounded-lg bg-cyan-50 p-2.5">
            <Icon className="h-5 w-5 text-cyan-600" />
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
    { label: "Events", id: "events", icon: Calendar },
    { label: "Blogs", id: "blogs", icon: FileText },
    { label: "Members", id: "members", icon: Users },
    { label: "Partners", id: "partners", icon: Handshake },
    { label: "Newsletter", id: "newsletter", icon: Mail },
    { label: "Email Automation", id: "automation", icon: Send },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-white fixed h-screen flex flex-col overflow-y-auto">
        <div className="border-b border-slate-800 p-5">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 font-bold text-white">
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
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-cyan-300">
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
                    ? "bg-cyan-500/15 text-cyan-200"
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

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              {activeTab === "dashboard" && "Control Center"}
              {activeTab === "events" && "Events Management"}
              {activeTab === "blogs" && "Blog Management"}
              {activeTab === "members" && "Members & Requests"}
              {activeTab === "partners" && "Partners Management"}
              {activeTab === "newsletter" && "Newsletter Management"}
              {activeTab === "automation" && "Email Automation"}
            </h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              {activeTab === "dashboard" && "Welcome back! Here's your admin overview."}
              {activeTab === "events" && "Create, edit, or manage event content"}
              {activeTab === "blogs" && "Create, edit, or manage blog posts"}
              {activeTab === "members" && "Manage members and guest event requests"}
              {activeTab === "partners" && "Add and manage partner logos shown on the landing page."}
              {activeTab === "newsletter" && "View subscribers and manage newsletter signups."}
              {activeTab === "automation" && "Send bulk campaigns to subscribers, members, or everyone."}
            </p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Calendar} label="Active Events" value={events.length} trend={`${events.filter(e => e.isPublished).length} published`} />
                <StatCard icon={FileText} label="Blog Posts" value={posts.length} trend={`${posts.filter(p => p.isPublished).length} published`} />
                <StatCard icon={Users} label="Total Members" value={members.length} trend={`${members.filter(m => m.role === "admin").length} admins`} />
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
                  <Button variant="outline" onClick={() => setActiveTab("partners")} className="gap-2">
                    <Handshake className="h-4 w-4" />
                    Partners
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-cyan-200 bg-cyan-50/70">
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
                <Card className="border-2 border-cyan-200 bg-cyan-50">
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
                      <Input placeholder="Slug" value={eventForm.slug} onChange={(e) => setEventForm((c) => ({ ...c, slug: e.target.value }))} />
                      <Input placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm((c) => ({ ...c, title: e.target.value }))} />
                    </div>
                    <Input placeholder="Subtitle" value={eventForm.subtitle} onChange={(e) => setEventForm((c) => ({ ...c, subtitle: e.target.value }))} />
                    <Textarea placeholder="Short Description" value={eventForm.shortDescription} onChange={(e) => setEventForm((c) => ({ ...c, shortDescription: e.target.value }))} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input placeholder="Date Label" value={eventForm.dateLabel} onChange={(e) => setEventForm((c) => ({ ...c, dateLabel: e.target.value }))} />
                      <Input placeholder="Location Label" value={eventForm.locationLabel} onChange={(e) => setEventForm((c) => ({ ...c, locationLabel: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Banner Image</label>
                        <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => setEventImageMode("url")}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              eventImageMode === "url"
                                ? "bg-cyan-500 text-white"
                                : "bg-transparent text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Paste URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventImageMode("upload")}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              eventImageMode === "upload"
                                ? "bg-cyan-500 text-white"
                                : "bg-transparent text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Upload className="inline h-3 w-3 mr-1" />
                            Upload File
                          </button>
                        </div>
                      </div>
                      {eventImageMode === "url" ? (
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={eventForm.bannerImage}
                          onChange={(e) => setEventForm((c) => ({ ...c, bannerImage: e.target.value }))}
                        />
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingEventBanner}
                            onClick={() => document.getElementById("event-banner-upload")?.click()}
                          >
                            {uploadingEventBanner ? "Uploading..." : "Choose Image"}
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
                          <span className="text-xs text-slate-500">File will be uploaded to Cloudinary</span>
                        </div>
                      )}
                      {eventForm.bannerImage && (
                        <img
                          src={eventForm.bannerImage}
                          alt={eventForm.bannerAlt || eventForm.title || "Event banner preview"}
                          className="h-28 w-full rounded-lg border border-slate-200 object-cover sm:h-36"
                        />
                      )}
                    </div>
                    <Input placeholder="Host Name" value={eventForm.hostName} onChange={(e) => setEventForm((c) => ({ ...c, hostName: e.target.value }))} />
                    <Textarea placeholder="About (one paragraph per line)" value={eventForm.about} onChange={(e) => setEventForm((c) => ({ ...c, about: e.target.value }))} />
                    <Textarea placeholder="Expectations (one per line)" value={eventForm.expectations} onChange={(e) => setEventForm((c) => ({ ...c, expectations: e.target.value }))} />
                    <Textarea placeholder="Differentiators (one per line)" value={eventForm.differentiators} onChange={(e) => setEventForm((c) => ({ ...c, differentiators: e.target.value }))} />
                    <Textarea placeholder="Audience (one per line)" value={eventForm.audience} onChange={(e) => setEventForm((c) => ({ ...c, audience: e.target.value }))} />
                    <Textarea placeholder="Tags (one per line)" value={eventForm.tags} onChange={(e) => setEventForm((c) => ({ ...c, tags: e.target.value }))} />
                    <Textarea placeholder="FAQs: question || answer" value={eventForm.faqs} onChange={(e) => setEventForm((c) => ({ ...c, faqs: e.target.value }))} />
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
                <Card className="border-2 border-cyan-200 bg-cyan-50">
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
                      <Input placeholder="Slug" value={blogForm.slug} onChange={(e) => setBlogForm((c) => ({ ...c, slug: e.target.value }))} />
                      <Input placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm((c) => ({ ...c, title: e.target.value }))} />
                    </div>
                    <Textarea placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm((c) => ({ ...c, excerpt: e.target.value }))} />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input placeholder="Author" value={blogForm.author} onChange={(e) => setBlogForm((c) => ({ ...c, author: e.target.value }))} />
                      <Input placeholder="Date" value={blogForm.date} onChange={(e) => setBlogForm((c) => ({ ...c, date: e.target.value }))} />
                      <Input placeholder="Read Time" value={blogForm.readTime} onChange={(e) => setBlogForm((c) => ({ ...c, readTime: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Cover Image</label>
                        <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => setBlogImageMode("url")}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              blogImageMode === "url"
                                ? "bg-cyan-500 text-white"
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
                                ? "bg-cyan-500 text-white"
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

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Members List</CardTitle>
                      <CardDescription>All registered members and their details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {members.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No members yet</p>
                      ) : (
                        members.map((member) => (
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
                              <div className="text-right">
                                <p className="text-xs text-slate-500">
                                  {new Date(member.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Login: {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : "Never"}
                                </p>
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
                        <p className="text-2xl font-bold text-purple-900">{members.filter(m => m.role === "admin").length}</p>
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
                    joinRequests.map((request) => (
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
                            {request.status && <Badge className="mt-2">{request.status}</Badge>}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                          {request.linkedinProfile && (
                            <a className="text-primary hover:underline" href={request.linkedinProfile} target="_blank" rel="noreferrer">LinkedIn</a>
                          )}
                          {request.website && (
                            <a className="text-primary hover:underline" href={request.website} target="_blank" rel="noreferrer">Website</a>
                          )}
                        </div>
                      </div>
                    ))
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
                    <div className="ml-4">
                      <Button variant="outline" size="sm" onClick={() => exportToCSV(partnerInquiries, "partner-inquiries")}>Export CSV</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {partnerInquiries.length === 0 ? (
                    <p className="py-8 text-center text-slate-500">No partnership inquiries yet.</p>
                  ) : (
                    partnerInquiries.map((inquiry) => (
                      <div key={inquiry._id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900">{inquiry.companyName}</h3>
                              <Badge variant="secondary">{inquiry.partnershipType}</Badge>
                              <Badge>{inquiry.status}</Badge>
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
                <Card className="border-2 border-cyan-200 bg-cyan-50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                      <CardTitle>{selectedPartnerId ? "Edit Partner" : "Add Partner"}</CardTitle>
                      <CardDescription>Name is required. Logo URL and Website URL are optional.</CardDescription>
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
                        placeholder="Partner Name"
                        value={partnerForm.name}
                        onChange={(e) => setPartnerForm((current) => ({ ...current, name: e.target.value }))}
                      />
                      <Input
                        placeholder="Display Order"
                        type="number"
                        value={partnerForm.order}
                        onChange={(e) => setPartnerForm((current) => ({ ...current, order: e.target.value }))}
                      />
                    </div>
                    <Input
                      placeholder="Logo URL (optional)"
                      value={partnerForm.logoUrl}
                      onChange={(e) => setPartnerForm((current) => ({ ...current, logoUrl: e.target.value }))}
                    />
                    <Input
                      placeholder="Website URL (optional)"
                      value={partnerForm.websiteUrl}
                      onChange={(e) => setPartnerForm((current) => ({ ...current, websiteUrl: e.target.value }))}
                    />

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
                      <Button onClick={handleSavePartner} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {selectedPartnerId ? "Update Partner" : "Create Partner"}
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
                              <img src={partner.logoUrl} alt={partner.name} className="h-12 w-24 rounded border border-slate-200 object-contain bg-white p-1" />
                            ) : (
                              <div className="h-12 w-24 rounded border border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center justify-center">No logo</div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900">{partner.name}</h3>
                                <Badge variant={partner.isActive ? "default" : "secondary"}>
                                  {partner.isActive ? "Active" : "Inactive"}
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
                                  logoUrl: partner.logoUrl || "",
                                  websiteUrl: partner.websiteUrl || "",
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
                        </select>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-500">Estimated recipients</p>
                        <p className="text-2xl font-bold text-slate-900">{recipientCountForAudience}</p>
                      </div>
                    </div>
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
                              ? "border-cyan-400 bg-cyan-50"
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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
