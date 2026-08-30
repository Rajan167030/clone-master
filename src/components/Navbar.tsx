import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession, getAccount, getToken, isAuthenticated } from "@/lib/session";
import { getMyFounderAccessApi, sendActivityHeartbeatApi } from "@/lib/api";

type NavDropdown = {
  label: string;
  items: Array<{ label: string; href: string }>;
};

const topLevelLinks = [
  { label: "Events", href: "/events" },
  { label: "Speakers", href: "/past-speakers-investors" },
  { label: "GetFunding", href: "/get-funding" },
  { label: "Partner", href: "/partner-with-us" },
];

const navDropdowns: NavDropdown[] = [
  {
    label: "About",
    items: [
      { label: "Company", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Our Team", href: "/team" },
      { label: "gallery", href: "/gallery" },
    ],
  },
  {
    label: "Explore",
    items: [
      { label: "College Partners", href: "/college-partners" },
      { label: "Membership", href: "/membership" },
      { label: "Product", href: "/product" },
    ],
  },
  {
    label: "Connect",
    items: [
      { label: "Activity (Bangalore)", href: "/activity" },
      { label: "Join Us", href: "/join-us" },
      { label: "Get Funding", href: "/get-funding" },
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
      {/* Membership Ticker */}
      <Link to="/membership" className="w-full bg-purple-600 text-white hover:bg-purple-700 transition-colors overflow-hidden py-1.5 flex items-center group cursor-pointer">
        <div className="animate-marquee flex whitespace-nowrap items-center" style={{ width: '200%' }}>
          {[...Array(40)].map((_, i) => (
            <span key={i} className="mx-4 md:mx-8 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase flex items-center">
              Membership
              <span className="ml-4 md:ml-8 w-1 h-1 rounded-full bg-white/50 block group-hover:bg-white transition-colors"></span>
            </span>
          ))}
        </div>
      </Link>

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
          <div className="hidden md:flex items-center gap-1">
            {topLevelLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors rounded-md hover:bg-slate-100/50"
              >
                {link.label}
              </Link>
            ))}
            {navDropdowns.map((dropdown) => (
              <div key={dropdown.label} className="relative group">
                <button className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors rounded-md hover:bg-slate-100/50">
                  {dropdown.label}
                  <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
                </button>

                {/* Dropdown Menu — curtain reveal from the top */}
                <div className="absolute left-0 top-full w-48 overflow-hidden invisible group-hover:visible">
                  <div className="origin-top scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100 transition-[transform,opacity] duration-300 ease-out bg-white border border-gray-200 rounded-md shadow-lg py-2">
                    {dropdown.items.map((item) => (
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
          <div className="flex items-center gap-3">
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
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — curtain reveal from the top */}
      <div
        className={`md:hidden grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isMobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <div className="space-y-1 mb-2">
              {topLevelLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {navDropdowns.map((dropdown) => (
              <div key={dropdown.label}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === dropdown.label ? null : dropdown.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                >
                  {dropdown.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openDropdown === dropdown.label ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Mobile Dropdown — curtain reveal */}
                <div
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    openDropdown === dropdown.label ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden pl-4 py-2 space-y-1">
                    {dropdown.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block px-3 py-2 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
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

            <Button asChild className="btn-metallic btn-metallic-purple w-full text-white text-sm">
              <Link to={topButtonTo}>
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
