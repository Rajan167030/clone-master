import { CalendarDays, FileText, LayoutDashboard, LogOut, Newspaper, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getAccount } from "@/lib/session";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const menuItems = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "My Events", to: "/events", icon: CalendarDays },
  { label: "Membership", to: "/membership", icon: ShieldCheck },
  { label: "Community", to: "/about", icon: Users },
  { label: "Blog", to: "/blog", icon: Newspaper },
];

type SidebarPanelProps = {
  onNavigate?: () => void;
};

const SidebarPanel = ({ onNavigate }: SidebarPanelProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const account = getAccount();

  return (
    <div className="flex h-full flex-col bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-5">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 font-bold text-white">
            FC
          </div>
          <div>
            <p className="font-semibold">Founders Connect</p>
            <p className="text-xs text-slate-400">Authenticated workspace</p>
          </div>
        </Link>
      </div>

      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Account</p>
        <p className="mt-2 text-sm font-semibold">{account?.fullName || "Member"}</p>
        <p className="text-xs text-slate-400">{account?.email}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-cyan-300">
          <FileText size={12} />
          {account?.role || "user"}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to;

          return (
            <Link
              key={label}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                active
                  ? "bg-cyan-500/15 text-cyan-200"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
          onClick={() => {
            clearSession();
            onNavigate?.();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  isMobile?: boolean;
};

const Sidebar = ({ mobileOpen = false, onMobileOpenChange, isMobile = false }: SidebarProps) => {
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[88vw] max-w-xs border-r border-slate-800 bg-slate-950 p-0 text-white">
          <SidebarPanel onNavigate={() => onMobileOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 shadow-lg lg:flex">
      <div className="h-full w-full">
        <SidebarPanel />
      </div>
    </aside>
  );
};

export default Sidebar;
