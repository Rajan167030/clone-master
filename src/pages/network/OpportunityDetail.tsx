import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarClock, ExternalLink, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { Chip, Logo, Spinner } from "@/components/network/NetworkUI";
import { getOpportunityApi, toggleSaveOpportunityApi, type OpportunityData } from "@/lib/api";
import { getToken } from "@/lib/session";
import { OPPORTUNITY_LABEL, formatDeadline } from "@/lib/network";

const OpportunityDetail = () => {
  const { slug = "" } = useParams();
  const token = getToken();
  const navigate = useNavigate();
  const [o, setO] = useState<OpportunityData | null>(null);
  const [error, setError] = useState("");
  useSEO({ title: o ? `${o.title} | Founders Connect` : "Opportunity | Founders Connect", description: o?.summary || "Startup opportunity on Founders Connect." });

  useEffect(() => {
    getOpportunityApi(slug, token).then((r) => setO(r.opportunity)).catch((e) => setError(e.message));
  }, [slug, token]);

  if (error) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="py-20 text-center"><p className="font-semibold">{error}</p><Button asChild variant="outline" className="mt-4"><Link to="/opportunities">All opportunities</Link></Button></div></div>;
  if (!o) return <div className="min-h-screen bg-slate-50"><Navbar /><Spinner /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link to="/opportunities" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-700"><ArrowLeft size={12} /> Opportunities</Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          {o.status !== "published" && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">This suggestion is {o.status === "pending" ? "awaiting review" : "not published"}.</p>}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Logo name={o.organizer || o.title} url={o.logoUrl} size={72} />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                <Chip tone="violet">{OPPORTUNITY_LABEL[o.type]}</Chip>
                {o.closingSoon && <Chip tone="red">Closing soon</Chip>}
                {o.isClosed && <Chip>Closed</Chip>}
              </div>
              <h1 className="mt-2 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">{o.title}</h1>
              {o.organizer && <p className="text-slate-500">by {o.organizer}</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1"><CalendarClock size={14} /> {formatDeadline(o.deadline)}</span>
                {(o.location || o.isOnline) && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {[o.location, o.isOnline ? "Online" : ""].filter(Boolean).join(" · ")}</span>}
              </div>
              {o.benefits && <p className="mt-3 text-lg font-semibold text-violet-800">{o.benefits}</p>}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {!o.isClosed && (
              <Button asChild className="bg-violet-600 hover:bg-violet-700"><a href={o.applyUrl} target="_blank" rel="noreferrer">Apply now <ExternalLink size={14} className="ml-1.5" /></a></Button>
            )}
            {o.status === "published" && (
              <Button
                variant="outline"
                onClick={async () => {
                  if (!token) return navigate("/login");
                  const r = await toggleSaveOpportunityApi(token, o._id).catch(() => null);
                  if (r) setO({ ...o, savedByMe: r.savedByMe });
                }}
              >
                {o.savedByMe ? <BookmarkCheck size={15} className="mr-1.5 text-violet-700" /> : <Bookmark size={15} className="mr-1.5" />}
                {o.savedByMe ? "Saved" : "Save"}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_260px]">
          <div className="space-y-6">
            {(o.summary || o.description) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-2 font-heading text-lg font-bold text-slate-900">About</h2>
                {o.summary && <p className="mb-2 font-medium text-slate-800">{o.summary}</p>}
                {o.description && <p className="whitespace-pre-line text-slate-700">{o.description}</p>}
              </section>
            )}
            {o.eligibility && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-2 font-heading text-lg font-bold text-slate-900">Eligibility</h2>
                <p className="whitespace-pre-line text-slate-700">{o.eligibility}</p>
              </section>
            )}
          </div>
          <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            {o.sectors.length > 0 && <div><p className="mb-1 text-xs font-bold uppercase text-slate-500">Sectors</p><div className="flex flex-wrap gap-1.5">{o.sectors.map((s) => <Chip key={s}>{s}</Chip>)}</div></div>}
            {o.stages.length > 0 && <div><p className="mb-1 text-xs font-bold uppercase text-slate-500">Stages</p><div className="flex flex-wrap gap-1.5">{o.stages.map((s) => <Chip key={s}>{s}</Chip>)}</div></div>}
            {o.tags.length > 0 && <div><p className="mb-1 text-xs font-bold uppercase text-slate-500">Tags</p><div className="flex flex-wrap gap-1.5">{o.tags.map((s) => <Chip key={s}>#{s}</Chip>)}</div></div>}
            <p className="text-xs text-slate-400">Always confirm details on the organizer's site before applying.</p>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OpportunityDetail;
