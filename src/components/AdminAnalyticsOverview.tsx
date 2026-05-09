import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type AdminEventInterest,
  type AdminJoinRequest,
  type AdminMember,
  type Campaign,
  type DynamicBlogPost,
  type DynamicEvent,
  type FundingApplication,
  type GalleryImage,
  type NewsletterSubscriber,
  type PartnerInquiry,
  type PartnerLogo,
  type SpeakerInvestorProfile,
  type Testimonial,
} from "@/lib/api";

type Timestamped = {
  createdAt?: string;
  updatedAt?: string;
  subscribedAt?: string;
};

type AdminAnalyticsOverviewProps = {
  events: Array<DynamicEvent & Timestamped>;
  posts: Array<DynamicBlogPost & Timestamped>;
  members: Array<AdminMember & Timestamped>;
  interests: Array<AdminEventInterest & Timestamped>;
  joinRequests: Array<AdminJoinRequest & Timestamped>;
  subscribers: Array<NewsletterSubscriber & Timestamped>;
  partners: Array<PartnerLogo & Timestamped>;
  galleryImages: Array<GalleryImage & Timestamped>;
  testimonials: Array<Testimonial & Timestamped>;
  partnerInquiries: Array<PartnerInquiry & Timestamped>;
  fundingApplications: Array<FundingApplication & Timestamped>;
  campaigns: Array<Campaign & Timestamped>;
  speakerProfiles?: Array<SpeakerInvestorProfile & Timestamped>;
};

const COLORS = ["#0f172a", "#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const numberFormatter = new Intl.NumberFormat("en-IN");
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" });

const getTimestamp = (item: Timestamped) => item.createdAt || item.subscribedAt || item.updatedAt || "";

const toDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getMonthWindows = (months = 6) => {
  const windows = [] as Array<{ key: string; label: string }>;
  const now = new Date();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    windows.push({ key: monthKey(cursor), label: monthFormatter.format(cursor) });
  }

  return windows;
};

const countByMonth = (items: Timestamped[], key: string) =>
  items.filter((item) => {
    const date = toDate(getTimestamp(item));
    return Boolean(date && monthKey(date) === key);
  }).length;

const countByStatus = <T extends { status?: string }>(items: T[]) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const status = String(item.status || "unknown").toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

const countByKey = <T extends Record<string, unknown>>(items: T[], key: string) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key] || "unknown").trim().toLowerCase() || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

const buildHeatmap = (items: Timestamped[]) => {
  const buckets = Array.from({ length: 7 }, () => 0);

  items.forEach((item) => {
    const date = toDate(getTimestamp(item));
    if (!date) return;
    buckets[date.getDay()] += 1;
  });

  return WEEKDAYS.map((day, index) => ({ day, count: buckets[index] }));
};

const DonutCard = ({
  title,
  data,
}: {
  title: string;
  data: Array<{ name: string; value: number }>;
}) => (
  <Card className="border-slate-200">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2}>
              {data.map((_, index) => (
                <Cell key={`${title}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => numberFormatter.format(Number(value) || 0)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const AdminAnalyticsOverview = ({
  events,
  posts,
  members,
  interests,
  joinRequests,
  subscribers,
  partners,
  galleryImages,
  testimonials,
  partnerInquiries,
  fundingApplications,
  campaigns,
  speakerProfiles = [],
}: AdminAnalyticsOverviewProps) => {
  const { monthlyForms, monthlyContent, contentInventory, roleSplit, partnerCategories, campaignStatus, fundingStatus, formHeatmap, funnelSteps, campaignMix } = useMemo(() => {
    const months = getMonthWindows(6);

    const monthlyForms = months.map((month) => ({
      month: month.label,
      members: countByMonth(members, month.key),
      eventInterests: countByMonth(interests, month.key),
      joinRequests: countByMonth(joinRequests, month.key),
      partnerInquiries: countByMonth(partnerInquiries, month.key),
      fundingApplications: countByMonth(fundingApplications, month.key),
      subscribers: countByMonth(subscribers, month.key),
    }));

    const monthlyContent = months.map((month) => ({
      month: month.label,
      events: countByMonth(events, month.key),
      blogs: countByMonth(posts, month.key),
      gallery: countByMonth(galleryImages, month.key),
      testimonials: countByMonth(testimonials, month.key),
      partners: countByMonth(partners, month.key),
      speakers: countByMonth(speakerProfiles, month.key),
    }));

    const contentInventory = [
      { name: "Events", active: events.filter((item) => item.isPublished !== false).length, inactive: events.filter((item) => item.isPublished === false).length },
      { name: "Blogs", active: posts.filter((item) => item.isPublished !== false).length, inactive: posts.filter((item) => item.isPublished === false).length },
      { name: "Gallery", active: galleryImages.filter((item) => item.isActive !== false).length, inactive: galleryImages.filter((item) => item.isActive === false).length },
      { name: "Testimonials", active: testimonials.filter((item) => item.isActive !== false).length, inactive: testimonials.filter((item) => item.isActive === false).length },
      { name: "Partners", active: partners.filter((item) => item.isActive !== false).length, inactive: partners.filter((item) => item.isActive === false).length },
      { name: "Speakers", active: speakerProfiles.filter((item) => item.isActive !== false).length, inactive: speakerProfiles.filter((item) => item.isActive === false).length },
    ];

    const roleCounts = countByKey(members, "role");
    const categoryCounts = countByKey(partners, "category");
    const campaignCounts = countByStatus(campaigns);
    const fundingCounts = countByStatus(fundingApplications);
    const heatmap = buildHeatmap([
      ...members,
      ...interests,
      ...joinRequests,
      ...subscribers,
      ...partnerInquiries,
      ...fundingApplications,
    ]);

    const funnelSignups = members.filter((member) => member.role !== "admin").length;
    const funnelInquiries = interests.length + joinRequests.length + partnerInquiries.length;
    const funnelApplications = fundingApplications.length;
    const funnelApprovals = fundingApplications.filter((item) => item.status === "approved").length + partnerInquiries.filter((item) => item.status === "approved").length;

    const campaignMix = campaigns.slice(0, 6).map((campaign, index) => ({
      name: campaign.name || campaign.subject || `Campaign ${index + 1}`,
      sent: Number(campaign.stats?.sent || 0),
      failed: Number(campaign.stats?.failed || 0),
      total: Number(campaign.stats?.total || 0),
    }));

    return {
      monthlyForms,
      monthlyContent,
      contentInventory,
      roleSplit: Object.entries(roleCounts).map(([name, value]) => ({ name: name === "unknown" ? "Unknown" : name.replace(/^./, (char) => char.toUpperCase()), value })),
      partnerCategories: Object.entries(categoryCounts).map(([name, value]) => ({ name: name === "unknown" ? "Unknown" : name.replace(/^./, (char) => char.toUpperCase()), value })),
      campaignStatus: Object.entries(campaignCounts).map(([name, value]) => ({ name: name.replace(/^./, (char) => char.toUpperCase()), value })),
      fundingStatus: Object.entries(fundingCounts).map(([name, value]) => ({ name: name.replace(/^./, (char) => char.toUpperCase()), value })),
      formHeatmap: heatmap,
      funnelSteps: [
        { label: "Signups", value: funnelSignups },
        { label: "Inquiries", value: funnelInquiries },
        { label: "Applications", value: funnelApplications },
        { label: "Approvals", value: funnelApprovals },
      ],
      campaignMix,
    };
  }, [campaigns, events, fundingApplications, galleryImages, interests, joinRequests, members, partnerInquiries, partners, posts, speakerProfiles, subscribers, testimonials]);

  const totals = useMemo(() => ({
    forms: members.length + interests.length + joinRequests.length + subscribers.length + partnerInquiries.length + fundingApplications.length,
    content: events.length + posts.length + galleryImages.length + testimonials.length + partners.length + speakerProfiles.length,
    approvals: fundingApplications.filter((item) => item.status === "approved").length + partnerInquiries.filter((item) => item.status === "approved").length,
  }), [events.length, fundingApplications, galleryImages.length, interests.length, joinRequests.length, members.length, partnerInquiries, partners.length, posts.length, speakerProfiles.length, subscribers.length, testimonials.length]);

  const maxHeatmap = Math.max(...formHeatmap.map((item) => item.count), 1);
  const maxFunnel = Math.max(...funnelSteps.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-600">Tracked Forms</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{numberFormatter.format(totals.forms)}</p>
            <p className="mt-2 text-xs text-slate-500">Members, inquiries, subscribers, and funding submissions</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-600">Content Items</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{numberFormatter.format(totals.content)}</p>
            <p className="mt-2 text-xs text-slate-500">Events, blogs, gallery, testimonials, partners, speakers</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-600">Approvals</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{numberFormatter.format(totals.approvals)}</p>
            <p className="mt-2 text-xs text-slate-500">Approved funding and partner review outcomes</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-slate-600">Campaign Mix</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{numberFormatter.format(campaignMix.length)}</p>
            <p className="mt-2 text-xs text-slate-500">Latest campaign performance snapshots</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 xl:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Form Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyForms}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="members" stroke="#0f172a" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="eventInterests" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="joinRequests" stroke="#7c3aed" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="partnerInquiries" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fundingApplications" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="subscribers" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 xl:col-span-2">
          <CardHeader>
            <CardTitle>Content Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyContent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="events" stackId="1" stroke="#0f172a" fill="#0f172a" fillOpacity={0.18} />
                  <Area type="monotone" dataKey="blogs" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.18} />
                  <Area type="monotone" dataKey="gallery" stackId="1" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} />
                  <Area type="monotone" dataKey="testimonials" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.18} />
                  <Area type="monotone" dataKey="partners" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.18} />
                  <Area type="monotone" dataKey="speakers" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.18} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 xl:col-span-2">
          <CardHeader>
            <CardTitle>Content Inventory Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentInventory} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" stackId="content" fill="#2563eb" name="Active / Published" />
                  <Bar dataKey="inactive" stackId="content" fill="#cbd5e1" name="Hidden / Draft" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <DonutCard title="Member Role Split" data={roleSplit.length ? roleSplit : [{ name: "No Data", value: 1 }]} />
        <DonutCard title="Partner Category Split" data={partnerCategories.length ? partnerCategories : [{ name: "No Data", value: 1 }]} />
        <DonutCard title="Funding Status Split" data={fundingStatus.length ? fundingStatus : [{ name: "No Data", value: 1 }]} />
        <DonutCard title="Campaign Status Split" data={campaignStatus.length ? campaignStatus : [{ name: "No Data", value: 1 }]} />

        <Card className="border-slate-200 xl:col-span-2">
          <CardHeader>
            <CardTitle>Tracked Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelSteps.map((step, index) => {
                const width = Math.max((step.value / maxFunnel) * 100, index === 0 ? 100 : 18);
                return (
                  <div key={step.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{step.label}</span>
                      <span className="font-semibold text-slate-900">{numberFormatter.format(step.value)}</span>
                    </div>
                    <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Visitor analytics are not tracked yet, so this funnel uses the forms currently captured in the admin panel.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 xl:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Delivery Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={campaignMix}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" interval={0} angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" stackId="campaign" fill="#2563eb" name="Sent" />
                  <Bar dataKey="failed" stackId="campaign" fill="#ef4444" name="Failed" />
                  <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} name="Total" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 xl:col-span-2">
          <CardHeader>
            <CardTitle>Submission Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-7">
              {formHeatmap.map((item) => {
                const intensity = item.count / maxHeatmap;
                return (
                  <div
                    key={item.day}
                    className="rounded-xl border border-slate-200 p-4 text-center"
                    style={{ backgroundColor: `rgba(37, 99, 235, ${0.08 + intensity * 0.8})` }}
                  >
                    <p className="text-xs font-semibold text-slate-700">{item.day}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{numberFormatter.format(item.count)}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              This combines all tracked submissions: member signups, event interests, join requests, subscribers, partner inquiries, and funding applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsOverview;