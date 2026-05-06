import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  createAdminBlogApi,
  createAdminEventApi,
  deleteAdminBlogApi,
  deleteAdminEventApi,
  getAdminBlogsApi,
  getCloudinaryUploadSignatureApi,
  getAdminEventInterestsApi,
  getAdminEventsApi,
  getAdminMembersApi,
  updateAdminBlogApi,
  updateAdminEventApi,
  type AdminEventInterest,
  type AdminMember,
  type DynamicBlogPost,
  type DynamicEvent,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
  Search,
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

type UploadTarget = "eventBanner" | "blogCover";

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
};

type ImageInputMode = "url" | "upload";

const Admin = () => {
  const token = useMemo(() => getToken() || "", []);
  const [events, setEvents] = useState<DynamicEvent[]>([]);
  const [posts, setPosts] = useState<DynamicBlogPost[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [interests, setInterests] = useState<AdminEventInterest[]>([]);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [blogForm, setBlogForm] = useState(emptyBlogForm);
  const [selectedEventSlug, setSelectedEventSlug] = useState("");
  const [selectedBlogSlug, setSelectedBlogSlug] = useState("");
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [eventImageMode, setEventImageMode] = useState<ImageInputMode>("url");
  const [blogImageMode, setBlogImageMode] = useState<ImageInputMode>("url");
  const [searchMembers, setSearchMembers] = useState("");
  const [searchEvents, setSearchEvents] = useState("");
  const [searchBlogs, setSearchBlogs] = useState("");
  const [searchInterests, setSearchInterests] = useState("");

  const loadAdminData = () => {
    Promise.all([
      getAdminEventsApi(token),
      getAdminBlogsApi(token),
      getAdminMembersApi(token),
      getAdminEventInterestsApi(token),
    ])
      .then(([eventsResponse, blogsResponse, membersResponse, interestsResponse]) => {
        setEvents(eventsResponse.events);
        setPosts(blogsResponse.posts);
        setMembers(membersResponse.members);
        setInterests(interestsResponse.interests);
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to load admin data.");
      });
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredMembers = useMemo(
    () =>
      members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(searchMembers.toLowerCase()) ||
          m.email.toLowerCase().includes(searchMembers.toLowerCase()) ||
          m.city.toLowerCase().includes(searchMembers.toLowerCase()),
      ),
    [members, searchMembers],
  );

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.title.toLowerCase().includes(searchEvents.toLowerCase()) ||
          e.slug.toLowerCase().includes(searchEvents.toLowerCase()),
      ),
    [events, searchEvents],
  );

  const filteredBlogs = useMemo(
    () =>
      posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchBlogs.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchBlogs.toLowerCase()),
      ),
    [posts, searchBlogs],
  );

  const filteredInterests = useMemo(
    () =>
      interests.filter(
        (i) =>
          i.fullName.toLowerCase().includes(searchInterests.toLowerCase()) ||
          i.email.toLowerCase().includes(searchInterests.toLowerCase()) ||
          i.title.toLowerCase().includes(searchInterests.toLowerCase()),
      ),
    [interests, searchInterests],
  );

  const exportToCSV = (data: unknown[], filename: string) => {
    if (!data.length) {
      window.alert("No data to export.");
      return;
    }

    const headers = Object.keys(data[0] as Record<string, unknown>);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => {
          const value = (row as Record<string, unknown>)[header];
          const strValue = String(value || "");
          return strValue.includes(",") ? `"${strValue}"` : strValue;
        }).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: unknown[], filename: string) => {
    if (!data.length) {
      window.alert("No data to export.");
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImageUpload = async (target: UploadTarget, file?: File | null) => {
    if (!file) {
      return;
    }

    if (!token) {
      window.alert("Please log in again before uploading images.");
      return;
    }

    setUploadingTarget(target);
    setUploadMessage(`Uploading ${file.name}...`);

    try {
      const signaturePayload = await getCloudinaryUploadSignatureApi(token, {
        folder: target === "eventBanner" ? "founders-connect/events" : "founders-connect/blogs",
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

      if (target === "eventBanner") {
        setEventForm((current) => ({
          ...current,
          bannerImage: uploadData.secure_url || "",
          bannerAlt: current.bannerAlt || current.title || file.name.replace(/\.[^.]+$/, ""),
        }));
      } else {
        setBlogForm((current) => ({
          ...current,
          coverImage: uploadData.secure_url || "",
        }));
      }

      setUploadMessage("Image uploaded successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image.";
      setUploadMessage(message);
      window.alert(message);
    } finally {
      setUploadingTarget(null);
    }
  };

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
        loadAdminData();
      })
      .catch((error) => {
        window.alert(error instanceof Error ? error.message : "Unable to save blog post.");
      });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 pb-16 pt-24">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-700">Admin Control Center</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Manage events, blogs, and member data</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            This admin workspace controls the dynamic event pages, blog content, member access data, and guest event registration requests.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Users</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{members.length}</p>
                </div>
                <Users className="h-8 w-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Events</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Blog Posts</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{posts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Event Requests</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{interests.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{selectedEventSlug ? "Edit Event" : "Create Event"}</CardTitle>
              <CardDescription>One line per list item. For FAQs use `question || answer` format.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Slug" value={eventForm.slug} onChange={(e) => setEventForm((c) => ({ ...c, slug: e.target.value }))} />
              <Input placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm((c) => ({ ...c, title: e.target.value }))} />
              <Input placeholder="Subtitle" value={eventForm.subtitle} onChange={(e) => setEventForm((c) => ({ ...c, subtitle: e.target.value }))} />
              <Textarea placeholder="Short Description" value={eventForm.shortDescription} onChange={(e) => setEventForm((c) => ({ ...c, shortDescription: e.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
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
                          ? "bg-violet-500 text-white"
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
                          ? "bg-violet-500 text-white"
                          : "bg-transparent text-slate-600 hover:text-slate-900"
                      }`}
                    >
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
                      disabled={uploadingTarget === "eventBanner"}
                      onClick={() => document.getElementById("event-banner-upload")?.click()}
                    >
                      {uploadingTarget === "eventBanner" ? "Uploading..." : "Choose Image"}
                    </Button>
                    <input
                      id="event-banner-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        void handleImageUpload("eventBanner", file);
                        e.target.value = "";
                      }}
                    />
                    <span className="text-xs text-slate-500">File will be uploaded to Cloudinary</span>
                  </div>
                )}

                {eventForm.bannerImage ? (
                  <img
                    src={eventForm.bannerImage}
                    alt={eventForm.bannerAlt || eventForm.title || "Event banner preview"}
                    className="h-28 w-full rounded-lg border border-slate-200 object-cover sm:h-36"
                  />
                ) : null}
              </div>
              <Input placeholder="Host Name" value={eventForm.hostName} onChange={(e) => setEventForm((c) => ({ ...c, hostName: e.target.value }))} />
              <Textarea placeholder="About (one paragraph per line)" value={eventForm.about} onChange={(e) => setEventForm((c) => ({ ...c, about: e.target.value }))} />
              <Textarea placeholder="Expectations (one per line)" value={eventForm.expectations} onChange={(e) => setEventForm((c) => ({ ...c, expectations: e.target.value }))} />
              <Textarea placeholder="Differentiators (one per line)" value={eventForm.differentiators} onChange={(e) => setEventForm((c) => ({ ...c, differentiators: e.target.value }))} />
              <Textarea placeholder="Audience (one per line)" value={eventForm.audience} onChange={(e) => setEventForm((c) => ({ ...c, audience: e.target.value }))} />
              <Textarea placeholder="Tags (one per line)" value={eventForm.tags} onChange={(e) => setEventForm((c) => ({ ...c, tags: e.target.value }))} />
              <Textarea placeholder="FAQs: question || answer" value={eventForm.faqs} onChange={(e) => setEventForm((c) => ({ ...c, faqs: e.target.value }))} />
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleSaveEvent}>{selectedEventSlug ? "Update Event" : "Create Event"}</Button>
                <Button type="button" variant="outline" onClick={() => { setSelectedEventSlug(""); setEventForm(emptyEventForm); }}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{selectedBlogSlug ? "Edit Blog Post" : "Create Blog Post"}</CardTitle>
              <CardDescription>For sections use `heading || content` on separate lines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Slug" value={blogForm.slug} onChange={(e) => setBlogForm((c) => ({ ...c, slug: e.target.value }))} />
              <Input placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm((c) => ({ ...c, title: e.target.value }))} />
              <Textarea placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm((c) => ({ ...c, excerpt: e.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-3">
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
                      disabled={uploadingTarget === "blogCover"}
                      onClick={() => document.getElementById("blog-cover-upload")?.click()}
                    >
                      {uploadingTarget === "blogCover" ? "Uploading..." : "Choose Image"}
                    </Button>
                    <input
                      id="blog-cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        void handleImageUpload("blogCover", file);
                        e.target.value = "";
                      }}
                    />
                    <span className="text-xs text-slate-500">File will be uploaded to Cloudinary</span>
                  </div>
                )}

                {blogForm.coverImage ? (
                  <img
                    src={blogForm.coverImage}
                    alt={blogForm.title || "Blog cover preview"}
                    className="h-28 w-full rounded-lg border border-slate-200 object-cover sm:h-36"
                  />
                ) : null}
              </div>
              <Textarea placeholder="Tags (one per line)" value={blogForm.tags} onChange={(e) => setBlogForm((c) => ({ ...c, tags: e.target.value }))} />
              <Textarea placeholder="Sections: heading || content" value={blogForm.sections} onChange={(e) => setBlogForm((c) => ({ ...c, sections: e.target.value }))} />
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleSaveBlog}>{selectedBlogSlug ? "Update Blog" : "Create Blog"}</Button>
                <Button type="button" variant="outline" onClick={() => { setSelectedBlogSlug(""); setBlogForm(emptyBlogForm); }}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dynamic Events</CardTitle>
                  <CardDescription>Edit or remove events that drive the public event pages.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(filteredEvents, "events")}
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportToJSON(filteredEvents, "events")}
                  >
                    <Download className="h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by title or slug..."
                  value={searchEvents}
                  onChange={(e) => setSearchEvents(e.target.value)}
                  className="h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div key={event.slug} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-500">{event.slug}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button
                        type="button"
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
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          deleteAdminEventApi(token, event.slug)
                            .then((response) => {
                              window.alert(response.message);
                              loadAdminData();
                            })
                            .catch((error) => window.alert(error instanceof Error ? error.message : "Unable to delete event."));
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No events found matching your search.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dynamic Blog Posts</CardTitle>
                  <CardDescription>Edit or remove posts used by the public blog pages.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(filteredBlogs, "blogs")}
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportToJSON(filteredBlogs, "blogs")}
                  >
                    <Download className="h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by title or slug..."
                  value={searchBlogs}
                  onChange={(e) => setSearchBlogs(e.target.value)}
                  className="h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((post) => (
                  <div key={post.slug} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{post.title}</p>
                    <p className="text-sm text-slate-500">{post.slug}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button
                        type="button"
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
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          deleteAdminBlogApi(token, post.slug)
                            .then((response) => {
                              window.alert(response.message);
                              loadAdminData();
                            })
                            .catch((error) => window.alert(error instanceof Error ? error.message : "Unable to delete blog post."));
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No blog posts found matching your search.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Members Data</CardTitle>
                  <CardDescription>View member role, location, login activity, and metadata.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(filteredMembers, "members")}
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportToJSON(filteredMembers, "members")}
                  >
                    <Download className="h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or city..."
                  value={searchMembers}
                  onChange={(e) => setSearchMembers(e.target.value)}
                  className="h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div key={member._id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{member.fullName}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-800">{member.role}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{member.city}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Created: {new Date(member.createdAt).toLocaleString()} | Last login: {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : "Never"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No members found matching your search.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Guest Event Requests</CardTitle>
                  <CardDescription>Non-member event interest submissions.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(filteredInterests, "event-requests")}
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => exportToJSON(filteredInterests, "event-requests")}
                  >
                    <Download className="h-4 w-4" />
                    JSON
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or title..."
                  value={searchInterests}
                  onChange={(e) => setSearchInterests(e.target.value)}
                  className="h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredInterests.length > 0 ? (
                filteredInterests.map((interest) => (
                  <div key={interest._id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{interest.title}</p>
                    <p className="text-sm text-slate-500">{interest.fullName} · {interest.email}</p>
                    <p className="mt-2 text-sm text-slate-600">{interest.note || "No note provided."}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {interest.city} · {interest.phone} · {new Date(interest.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No requests found matching your search.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Quick Access</h2>
          {uploadMessage ? <p className="mt-2 text-sm text-slate-600">{uploadMessage}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/events" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
              View Public Events
            </Link>
            <Link to="/blog" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
              View Public Blog
            </Link>
            <Button type="button" variant="outline" onClick={loadAdminData}>
              Refresh Data
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
