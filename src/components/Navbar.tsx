import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession, getAccount, getToken, isAuthenticated } from "@/lib/session";
import { getMyFounderAccessApi, sendActivityHeartbeatApi } from "@/lib/api";

type NavMenuItem = {
  label: string;
  href?: string;
  items: Array<{ label: string; href: string }>;
};

const navigationMenu: NavMenuItem[] = [
  {
    label: "Events",
    href: "/events",
    items: [
      { label: "Upcoming Events", href: "/events?tab=upcoming" },
      { label: "Past Events", href: "/events?tab=past" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Speakers", href: "/past-speakers-investors" },
      { label: "Mentors", href: "/mentors" },
      { label: "Investors", href: "/investors" },
    ],
  },
  {
    label: "Chapters",
    href: "/chapters",
    items: [
      { label: "Explore Chapters", href: "/chapters" },
      { label: "City Communities", href: "/city-communities" },
    ],
  },
  {
    label: "Our Partners",
    items: [
      { label: "Corporate Partners", href: "/corporate-partners" },
      { label: "College & Incubator Partners", href: "/college-partners" },
      { label: "Ecosystem Partners", href: "/ecosystem-partners" },
    ],
  },
  {
    label: "Cohorts",
    items: [
      { label: "Startup Cohorts", href: "/cohorts" },
      { label: "D2C Cohorts", href: "/cohorts/d2c" },
      { label: "Upcoming Programs", href: "/cohorts/upcoming" },
    ],
  },
  {
    label: "About",
    items: [
      { label: "Company", href: "/about" },
      { label: "Our Team", href: "/team" },
      { label: "Blog", href: "/blog" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    label: "Explore",
    items: [
      { label: "Products", href: "/product" },
      { label: "Startup Resources", href: "/startup-resources" },
      { label: "Funding & Grants", href: "/get-funding" },
    ],
  },
  {
    label: "Connect",
    items: [
      { label: "Join Us", href: "/join-us" },
      { label: "Become a Member", href: "/become-a-member" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
  {
    label: "FALCON Club",
    href: "/falcon-club",
    items: [
      { label: "FALCON Club Overview", href: "/falcon-club" },
      { label: "5 Membership Levels", href: "/falcon-club#membership-criteria" },
      { label: "Request Access", href: "/falcon-club#membership-form-section" },
      { label: "Member Directory", href: "/falcon-club#members-directory" },
    ],
  },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const account = getAccount();
  const isAdmin = account?.role === "admin" || account?.role === "superadmin";
  const [founderAccessToken, setFounderAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token || account?.role !== "founder") return;

    getMyFounderAccessApi(token)
      .then((response) => setFounderAccessToken(response.accessToken))
      .catch(() => setFounderAccessToken(null));
  }, [account?.role]);

  // Presence heartbeat: lets the admin panel show which investors/startups are active on the
  // site right now (Bangalore Activity tables). Only founders/investors are tracked for this.
  useEffect(() => {
    if (account?.role !== "founder" && account?.role !== "investor") return;
    const token = getToken();
    if (!token) return;

    const beat = () => {
      sendActivityHeartbeatApi(token).catch(() => {});
    };
    beat();
    const interval = setInterval(beat, 25000);
    return () => clearInterval(interval);
  }, [account?.role]);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const topButtonLabel = authed ? (isAdmin ? "Admin Panel" : "Dashboard") : "Login";
  const topButtonTo = authed ? (isAdmin ? "/admin" : "/dashboard") : "/login";

  // The FALCON Club page has a dark/gold hero, so the navbar switches to a matching dark theme there.
  const isDark = /^\/(falcon|fable)-club(\/|$)/.test(location.pathname);
  const theme = isDark
    ? {
        header: "shadow-[0_1px_0_rgba(245,158,11,0.08)]",
        nav: "border-b border-amber-500/15 bg-[#090a0f]/80 backdrop-blur-lg backdrop-saturate-150 supports-[backdrop-filter]:bg-[#090a0f]/70",
        item: "font-medium text-slate-300 hover:text-amber-300 hover:bg-white/5",
        falconItem: "font-bold text-amber-300 bg-amber-500/10 border border-amber-400/40 hover:text-amber-200",
        crown: "text-amber-400",
        chevron: "text-slate-500",
        falconChevron: "text-amber-300",
        dropdown: "bg-[#0f1118] border border-amber-500/20",
        dropdownLink: "text-slate-300 hover:bg-amber-500/10 hover:text-amber-300",
        name: "text-slate-400",
        logout: "text-slate-300 hover:text-red-400",
        sais: "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
        cta: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold",
        hamburger: "text-slate-200 hover:bg-white/10",
        mobilePanel: "border-t border-amber-500/15 bg-[#0b0c12]",
        mobileRow: "border-white/5",
        mobileLabel: "text-slate-200 hover:text-amber-300",
        mobileFalcon: "text-amber-300",
        mobileToggle: "text-slate-400 hover:bg-white/10",
        mobileToggleOpen: "text-amber-300",
        mobileSub: "text-slate-400 hover:text-amber-300 hover:bg-amber-500/10",
        mobileDivider: "border-white/10",
      }
    : {
        header: "shadow-sm",
        nav: "border-b border-white/20 bg-white/60 backdrop-blur-lg backdrop-saturate-150 supports-[backdrop-filter]:bg-white/50",
        item: "font-medium text-slate-700 hover:text-purple-600 hover:bg-slate-100/50",
        falconItem: "font-bold text-amber-700 bg-amber-500/10 border border-amber-400/40 hover:text-amber-800",
        crown: "text-amber-600",
        chevron: "text-slate-500",
        falconChevron: "text-amber-700",
        dropdown: "bg-white border border-gray-200",
        dropdownLink: "text-slate-700 hover:bg-purple-50 hover:text-purple-600",
        name: "text-slate-600",
        logout: "text-slate-700 hover:text-red-600",
        sais: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100/70",
        cta: "btn-metallic btn-metallic-purple text-white",
        hamburger: "text-slate-700 hover:bg-slate-100",
        mobilePanel: "border-t border-gray-200 bg-white",
        mobileRow: "border-gray-100",
        mobileLabel: "text-slate-800 hover:text-purple-600",
        mobileFalcon: "text-amber-700",
        mobileToggle: "text-slate-500 hover:bg-slate-100",
        mobileToggleOpen: "text-purple-600",
        mobileSub: "text-slate-600 hover:text-purple-600 hover:bg-purple-50",
        mobileDivider: "border-gray-200",
      };

  const saisRoomTo = isAdmin
    ? "/admin/sais26-room"
    : account?.role === "investor"
      ? "/sais26/room"
      : account?.role === "founder" && founderAccessToken
        ? `/sais26/founder/${founderAccessToken}`
        : null;

  return (
    <header className={`sticky top-0 z-50 flex flex-col w-full ${theme.header}`}>
      <nav className={`w-full ${theme.nav}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            {/* Logo */}
            <Link to={authed ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/founders_connect_global_logo.jpg"
                alt="Founders Connect"
                className="h-12 w-auto object-contain rounded"
              />
            </Link>

            {/* Desktop Navigation — spread evenly across the space between logo and actions */}
            <div className="hidden xl:flex flex-1 min-w-0 items-center justify-evenly mx-3">
              {navigationMenu.map((menuItem) => {
                const isFalcon = menuItem.label === "FALCON Club";
                // Every item shares one pill shape so widths and gaps stay uniform.
                const itemClass = `inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-2 text-[13px] transition-colors ${
                  isFalcon ? theme.falconItem : theme.item
                }`;
                const label = (
                  <>
                    {isFalcon && <Crown size={14} className={theme.crown} />}
                    {menuItem.label}
                    <ChevronDown
                      size={14}
                      className={`group-hover:rotate-180 transition-transform duration-200 ${isFalcon ? theme.falconChevron : theme.chevron}`}
                    />
                  </>
                );

                return (
                <div key={menuItem.label} className="relative group">
                  {menuItem.href ? (
                    <Link to={menuItem.href} className={itemClass}>
                      {label}
                    </Link>
                  ) : (
                    <button type="button" className={itemClass}>
                      {label}
                    </button>
                  )}

                  {/* Dropdown Menu — curtain reveal from the top */}
                  <div className="absolute left-0 top-full w-52 overflow-hidden invisible group-hover:visible pt-1 z-50">
                    <div className={`origin-top scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100 transition-[transform,opacity] duration-250 ease-out rounded-lg shadow-xl py-2 ${theme.dropdown}`}>
                      {menuItem.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className={`block px-4 py-2 text-sm transition-colors ${theme.dropdownLink}`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
              {authed && (
                <div className="hidden sm:flex items-center gap-3">
                  {/* Hidden while the full desktop menu is shown — there isn't room beside it */}
                  <span className={`xl:hidden max-w-[10rem] truncate text-sm ${theme.name}`}>{account?.fullName || account?.email}</span>
                  <button
                    onClick={handleLogout}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${theme.logout}`}
                    title={`Logout${account?.fullName || account?.email ? ` (${account?.fullName || account?.email})` : ""}`}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}

              {saisRoomTo && (
                <Link
                  to={saisRoomTo}
                  title="SAIS Room"
                  aria-label="SAIS Room"
                  className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-sm font-bold shadow-sm transition-all ${theme.sais}`}
                >
                  <Sparkles size={16} />
                  <span className="xl:hidden">SAIS Room</span>
                </Link>
              )}

              <Button asChild className={`hidden sm:inline-flex text-sm ${theme.cta}`}>
                <Link to={topButtonTo}>
                  <span className="relative z-[2]">{topButtonLabel}</span>
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`xl:hidden p-2 rounded-md transition-colors ${theme.hamburger}`}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — curtain reveal from the top */}
        <div
          className={`xl:hidden grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
            isMobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className={`min-h-0 overflow-y-auto max-h-[80vh] ${theme.mobilePanel}`}>
            <div className="px-4 py-4 space-y-2">
              {navigationMenu.map((menuItem) => (
                <div key={menuItem.label} className={`border-b pb-2 ${theme.mobileRow}`}>
                  <div className="flex items-center justify-between">
                    {menuItem.href ? (
                      <Link
                        to={menuItem.href}
                        className={`text-sm font-semibold py-1.5 flex items-center gap-1.5 ${
                          menuItem.label === "FALCON Club"
                            ? `${theme.mobileFalcon} font-bold`
                            : theme.mobileLabel
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {menuItem.label === "FALCON Club" && <Crown size={14} className={theme.crown} />}
                        {menuItem.label}
                      </Link>
                    ) : (
                      <span className={`text-sm font-semibold py-1.5 ${theme.mobileLabel}`}>{menuItem.label}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === menuItem.label ? null : menuItem.label)}
                      className={`p-1.5 rounded-md transition-colors ${theme.mobileToggle}`}
                      aria-label={`Toggle ${menuItem.label}`}
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === menuItem.label ? `rotate-180 ${theme.mobileToggleOpen}` : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Mobile Dropdown Subitems */}
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-250 ease-out ${
                      openDropdown === menuItem.label ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden pl-3 py-1 space-y-1">
                      {menuItem.items.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${theme.mobileSub}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {authed && (
                <div className={`border-t pt-3 mt-3 ${theme.mobileDivider}`}>
                  <span className={`block px-3 py-2 text-xs ${theme.name}`}>{account?.fullName || account?.email}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}

              {saisRoomTo && (
                <Link
                  to={saisRoomTo}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold shadow-sm transition-all ${theme.sais}`}
                >
                  <Sparkles size={16} />
                  SAIS Room
                </Link>
              )}

              <Button asChild className={`w-full text-sm mt-2 ${theme.cta}`}>
                <Link to={topButtonTo} onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="relative z-[2]">{topButtonLabel}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
