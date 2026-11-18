import { useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Check, Clock, Loader2, MessageCircle, UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { requestConnectionApi, respondConnectionApi, type ConnectionState, type NetworkPerson } from "@/lib/api";
import { getToken } from "@/lib/session";

export const Avatar = ({ person, size = 40 }: { person: Pick<NetworkPerson, "fullName" | "photo">; size?: number }) => (
  <div className="shrink-0 overflow-hidden rounded-full bg-violet-100" style={{ width: size, height: size }}>
    {person.photo ? (
      <img src={person.photo} alt="" className="h-full w-full object-cover" loading="lazy" />
    ) : (
      <div className="flex h-full w-full items-center justify-center font-bold text-violet-700" style={{ fontSize: size * 0.38 }}>
        {(person.fullName || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
      </div>
    )}
  </div>
);

export const Logo = ({ name, url, size = 48 }: { name: string; url?: string; size?: number }) => (
  <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white" style={{ width: size, height: size }}>
    {url ? (
      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-violet-50 font-extrabold text-violet-700" style={{ fontSize: size * 0.4 }}>
        {(name || "?").slice(0, 1).toUpperCase()}
      </div>
    )}
  </div>
);

export const Chip = ({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "violet" | "emerald" | "amber" | "red" }) => {
  const cls = { slate: "bg-slate-100 text-slate-700", violet: "bg-violet-100 text-violet-800", emerald: "bg-emerald-100 text-emerald-800", amber: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-800" }[tone];
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{children}</span>;
};

export const PersonLine = ({ person, sub }: { person: NetworkPerson; sub?: ReactNode }) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar person={person} />
    <div className="min-w-0">
      {person.startupSlug ? (
        <Link to={`/startups/${person.startupSlug}`} className="block truncate font-semibold text-slate-900 hover:text-violet-700">{person.fullName}</Link>
      ) : (
        <p className="truncate font-semibold text-slate-900">{person.fullName}</p>
      )}
      <p className="truncate text-xs text-slate-500">
        {sub ?? [person.headline || person.startupName, person.city].filter(Boolean).join(" · ")}
      </p>
    </div>
  </div>
);

export const Empty = ({ icon: Icon, title, text, action }: { icon: typeof Clock; title: string; text?: string; action?: ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
    <Icon className="mx-auto mb-3 h-8 w-8 text-violet-400" />
    <p className="font-semibold text-slate-800">{title}</p>
    {text && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Spinner = () => (
  <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-violet-600" /></div>
);

/** Connect button that understands every connection state. */
export const ConnectButton = ({
  accountId,
  name,
  state,
  onChange,
  intent = "network",
  size = "sm",
}: {
  accountId: string;
  name: string;
  state: ConnectionState;
  onChange: (s: ConnectionState) => void;
  intent?: "network" | "cofounder" | "collaboration";
  size?: "sm" | "default";
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = getToken();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (state.status === "self") return null;
  if (state.status === "connected") {
    return (
      <Button asChild size={size} variant="outline">
        <Link to={`/community/messages/${accountId}`}><MessageCircle size={14} className="mr-1.5" /> Message</Link>
      </Button>
    );
  }
  if (state.status === "outgoing") {
    return <Button size={size} variant="outline" disabled><Clock size={14} className="mr-1.5" /> Requested</Button>;
  }
  if (state.status === "incoming") {
    return (
      <Button
        size={size}
        disabled={busy}
        className="bg-violet-600 hover:bg-violet-700"
        onClick={async () => {
          if (!token || !state.connectionId) return;
          setBusy(true);
          try {
            await respondConnectionApi(token, state.connectionId, "accept");
            onChange({ status: "connected", connectionId: state.connectionId });
          } catch (e) {
            toast({ title: "Could not accept", description: (e as Error).message, variant: "destructive" });
          } finally {
            setBusy(false);
          }
        }}
      >
        <Check size={14} className="mr-1.5" /> Accept request
      </Button>
    );
  }

  const send = async () => {
    if (!token) return navigate("/login");
    setBusy(true);
    try {
      const res = await requestConnectionApi(token, { recipientId: accountId, intent, note });
      onChange(res);
      setOpen(false);
      toast({ title: res.status === "connected" ? "You're now connected" : "Request sent" });
    } catch (e) {
      toast({ title: "Could not send", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button size={size} className="bg-violet-600 hover:bg-violet-700" onClick={() => (token ? setOpen(true) : navigate("/login"))}>
        <UserPlus size={14} className="mr-1.5" /> {intent === "cofounder" ? "I'm interested" : "Connect"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{intent === "cofounder" ? `Co-founder intro to ${name}` : `Connect with ${name}`}</DialogTitle>
            <DialogDescription>A short note about why you'd like to connect gets far more replies.</DialogDescription>
          </DialogHeader>
          <Textarea rows={4} maxLength={500} placeholder="Hi! I'm building… and would love to swap notes on…" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button onClick={send} disabled={busy} className="bg-violet-600 hover:bg-violet-700">
            {busy && <Loader2 size={14} className="mr-1.5 animate-spin" />} Send request
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

const NAV = [
  { to: "/network", label: "My network", end: true },
  { to: "/startups", label: "Startups" },
  { to: "/network/cofounders", label: "Co-founders" },
  { to: "/network/collab", label: "Collab board" },
  { to: "/groups", label: "Groups & circles" },
  { to: "/opportunities", label: "Opportunities" },
];

export const NetworkLayout = ({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <div className="border-b border-slate-200 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        <nav className="-mb-px flex gap-1 overflow-x-auto pt-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${isActive ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-800"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  </div>
);

export const FilterPills = <T extends string>({ options, value, onChange, labels }: { options: T[]; value: NoInfer<T> | ""; onChange: (v: NoInfer<T> | "") => void; labels: Record<string, string> }) => (
  <div className="flex flex-wrap gap-2">
    {(["", ...options] as (T | "")[]).map((o) => (
      <button
        key={o || "all"}
        type="button"
        onClick={() => onChange(o)}
        className={`rounded-full border px-3 py-1 text-xs font-semibold ${value === o ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}
      >
        {o ? labels[o] || o : "All"}
      </button>
    ))}
  </div>
);
