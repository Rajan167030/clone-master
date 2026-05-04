import { Bell, CalendarDays, Menu, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

interface TopbarProps {
  userRole?: string;
  userName?: string;
  referralCode?: string;
  participationCount?: number;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

const Topbar = ({
  userRole = "Member",
  userName = "Guest",
  referralCode = "N/A",
  participationCount = 0,
  isMobile = false,
  onMenuClick,
}: TopbarProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {isMobile && (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 lg:hidden"
              onClick={onMenuClick}
            >
              <Menu size={18} />
            </button>
          )}

          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Founders Connect Workspace</p>
            <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              Welcome, {userName} <span className="text-slate-500">({userRole})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 md:block">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Referral Code</p>
            <p className="text-sm font-semibold text-slate-900">{referralCode}</p>
          </div>

          <div className="hidden rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-2 xl:block">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-700">Event Participation</p>
            <p className="text-sm font-semibold text-slate-900">{participationCount} registered events</p>
          </div>

          <Link
            to="/events"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex"
          >
            <CalendarDays size={16} />
            <span className="hidden md:inline">Events</span>
          </Link>

          <Link
            to="/membership"
            className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-3 py-2 text-sm font-medium text-white sm:inline-flex"
          >
            <Ticket size={16} />
            <span className="hidden md:inline">Membership</span>
          </Link>

          <button type="button" className="relative rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
