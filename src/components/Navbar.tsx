import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Sparkles } from "lucide-react";
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

  const saisRoomTo = isAdmin
    ? "/admin/sais26-room"
    : account?.role === "investor"
      ? "/sais26/room"
      : account?.role === "founder" && founderAccessToken
        ? `/sais26/founder/${founderAccessToken}`
        : null;

  return (
    <header className="sticky top-0 z-50 flex flex-col w-full shadow-sm">
      <nav className="w-full border-b border-white/20 bg-white/60 backdrop-blur-lg backdrop-saturate-150 supports-[backdrop-filter]:bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to={authed ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/founders_connect_global_logo.jpg"
                alt="Founders Connect"
                className="h-12 w-auto object-contain rounded"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {navigationMenu.map((menuItem) => (
                <div key={menuItem.label} className="relative group">
                  {menuItem.href ? (
                    <div className="inline-flex items-center">
                      <Link
                        to={menuItem.href}
                        className="px-2.5 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors rounded-l-md hover:bg-slate-100/50"
                      >
                        {menuItem.label}
                      </Link>
                      <button
                        type="button"
                        className="p-1 text-slate-500 hover:text-purple-600 transition-colors rounded-r-md hover:bg-slate-100/50"
                        aria-label={`${menuItem.label} menu`}
                      >
                        <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                      </button>
                    </div>
                  ) : (
                    <button className="inline-flex items-center gap-1 px-2.5 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors rounded-md hover:bg-slate-100/50">
                      {menuItem.label}
                      <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                  )}

                  {/* Dropdown Menu — curtain reveal from the top */}
                  <div className="absolute left-0 top-full w-52 overflow-hidden invisible group-hover:visible pt-1 z-50">
                    <div className="origin-top scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100 transition-[transform,opacity] duration-250 ease-out bg-white border border-gray-200 rounded-lg shadow-xl py-2">
                      {menuItem.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {authed && (
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-xs sm:text-sm text-slate-600">{account?.fullName || account?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}

              {saisRoomTo && (
                <Link
                  to={saisRoomTo}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 shadow-sm transition-all hover:bg-purple-100/70"
                >
                  <Sparkles size={16} />
                  SAIS Room
                </Link>
              )}

              <Button asChild className="btn-metallic btn-metallic-purple hidden sm:inline-flex text-white text-sm">
                <Link to={topButtonTo}>
                  <span className="relative z-[2]">{topButtonLabel}</span>
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — curtain reveal from the top */}
        <div
          className={`lg:hidden grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
            isMobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-y-auto max-h-[80vh] border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navigationMenu.map((menuItem) => (
                <div key={menuItem.label} className="border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between">
                    {menuItem.href ? (
                      <Link
                        to={menuItem.href}
                        className="text-sm font-semibold text-slate-800 hover:text-purple-600 py-1.5"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {menuItem.label}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-slate-800 py-1.5">{menuItem.label}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === menuItem.label ? null : menuItem.label)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                      aria-label={`Toggle ${menuItem.label}`}
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === menuItem.label ? "rotate-180 text-purple-600" : ""
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
                          className="block px-3 py-1.5 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
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
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <span className="block px-3 py-2 text-xs text-slate-600">{account?.fullName || account?.email}</span>
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
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 shadow-sm transition-all hover:bg-purple-100/70"
                >
                  <Sparkles size={16} />
                  SAIS Room
                </Link>
              )}

              <Button asChild className="btn-metallic btn-metallic-purple w-full text-white text-sm mt-2">
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
