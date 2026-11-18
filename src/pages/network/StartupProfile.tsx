import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, Calendar, ExternalLink, Globe, MapPin, Pencil, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { Avatar, Chip, ConnectButton, Logo, Spinner } from "@/components/network/NetworkUI";
import { getStartupApi, type ConnectionState } from "@/lib/api";
import { getToken } from "@/lib/session";
import { COFOUNDER_ROLE_LABEL, COLLAB_LABEL, COMMITMENT_LABEL, LOOKING_FOR_LABEL, stageLabel, timeAgo } from "@/lib/network";

type Data = Awaited<ReturnType<typeof getStartupApi>>;

const StartupProfile = () => {
  const { slug = "" } = useParams();
  const token = getToken();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [conn, setConn] = useState<ConnectionState>({ status: "none" });

  useSEO({
    title: data ? `${data.startup.startupName || data.startup.founder.fullName} | Founders Connect` : "Startup | Founders Connect",
    description: data?.startup.oneLiner || "A startup on Founders Connect.",
  });

  useEffect(() => {
    getStartupApi(slug, token)
      .then((r) => {
        setData(r);
        setConn(r.connection);
      })
      .catch((e) => setError(e.message));
  }, [slug, token]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto max-w-xl px-4 py-20 text-center">
          <p className="text-lg font-semibold">{error}</p>
          <Button asChild variant="outline" className="mt-5"><Link to="/startups">Back to directory</Link></Button>
        </div>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen bg-slate-50"><Navbar /><Spinner /></div>;

  const s = data.startup;
  const f = s.founder;
  const isMe = conn.status === "self";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link to="/startups" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-700"><ArrowLeft size={12} /> Startup directory</Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Logo name={s.startupName || f.fullName} url={s.logoUrl} size={72} />
              <div>
                <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">{s.startupName || f.fullName}</h1>
                {s.oneLiner && <p className="mt-1 text-slate-600">{s.oneLiner}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  {stageLabel(s.stage) && <span>{stageLabel(s.stage)}</span>}
                  {s.city && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {s.city}</span>}
                  <span className="inline-flex items-center gap-1"><Users size={13} /> {s.teamSize} people</span>
                  {s.foundedYear && <span className="inline-flex items-center gap-1"><Calendar size={13} /> Since {s.foundedYear}</span>}
                  {s.businessModel && <span className="uppercase">{s.businessModel}</span>}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {isMe ? (
                <Button asChild variant="outline"><Link to="/network/profile"><Pencil size={14} className="mr-1.5" /> Edit</Link></Button>
              ) : (
                <ConnectButton accountId={f.id} name={f.fullName} state={conn} onChange={setConn} size="default" />
              )}
              {s.website && (
                <Button asChild variant="outline"><a href={s.website} target="_blank" rel="noreferrer"><Globe size={14} className="mr-1.5" /> Website</a></Button>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {s.sectors.map((x) => <Chip key={x}>{x}</Chip>)}
            {s.lookingFor.map((x) => <Chip key={x} tone="violet">Seeking {LOOKING_FOR_LABEL[x].toLowerCase()}</Chip>)}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {s.description && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-2 font-heading text-lg font-bold text-slate-900">About</h2>
                <p className="whitespace-pre-line text-slate-700">{s.description}</p>
              </section>
            )}

            {s.cofounder.isLooking && (
              <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-6">
                <h2 className="mb-2 font-heading text-lg font-bold text-violet-900">Looking for a co-founder</h2>
                <div className="flex flex-wrap gap-1.5">
                  {s.cofounder.rolesWanted.map((r) => <Chip key={r} tone="violet">{COFOUNDER_ROLE_LABEL[r]}</Chip>)}
                  {s.cofounder.commitment && <Chip>{COMMITMENT_LABEL[s.cofounder.commitment]}</Chip>}
                  {s.cofounder.remoteOk && <Chip>Remote OK</Chip>}
                  {s.cofounder.equity && <Chip tone="emerald">Equity: {s.cofounder.equity}</Chip>}
                </div>
                {s.cofounder.pitch && <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{s.cofounder.pitch}</p>}
                {!isMe && conn.status === "none" && (
                  <div className="mt-4"><ConnectButton accountId={f.id} name={f.fullName} state={conn} onChange={setConn} intent="cofounder" /></div>
                )}
              </section>
            )}

            {data.openCollabs.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="mb-3 font-heading text-lg font-bold text-slate-900">Open on the collab board</h2>
                <ul className="space-y-2">
                  {data.openCollabs.map((c) => (
                    <li key={c._id}>
                      <Link to={`/network/collab?post=${c._id}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-violet-300">
                        <span><Chip tone="violet">{COLLAB_LABEL[c.type]}</Chip> <span className="ml-1 font-medium text-slate-800">{c.title}</span></span>
                        <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Founder</p>
              <div className="flex items-center gap-3">
                <Avatar person={f} size={52} />
                <div>
                  <p className="font-semibold text-slate-900">{f.fullName}</p>
                  {(s.role || f.headline) && <p className="text-sm text-slate-500">{s.role || f.headline}</p>}
                  <p className="text-xs text-slate-400">{s.connectionsCount} connections</p>
                </div>
              </div>
              {s.bio && <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{s.bio}</p>}
              {s.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">{s.skills.map((x) => <Chip key={x}>{x}</Chip>)}</div>
              )}
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {s.linkedinUrl && <a href={s.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-violet-700"><ExternalLink size={14} /> LinkedIn</a>}
                {f.profileId && <Link to={`/profile/${f.profileId}`} className="inline-flex items-center gap-1 font-medium text-violet-700"><ExternalLink size={14} /> Member card</Link>}
              </div>
            </div>
            {s.fundingStatus && (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <Briefcase size={15} className="text-violet-600" /> Funding: <span className="font-medium capitalize text-slate-800">{s.fundingStatus.replace(/_/g, " ")}</span>
              </div>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StartupProfile;
